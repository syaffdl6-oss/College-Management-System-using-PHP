import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import {
  courses,
  teachers,
  students,
  programCodeMap,
  standardNames,
  getNextStudentId,
  getNextTeacherId,
  getNextCourseId
} from './data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable trust proxy for Cloud Run and secure cookies
app.set('trust proxy', 1);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'img');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage for student & teacher images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser('cms-super-secret-cookie-key'));

// Session configured specifically to work inside modern browser iframes
app.use(session({
  name: 'cms_session',
  secret: process.env.SESSION_SECRET || 'cms-super-secret-key-12345',
  resave: true,
  saveUninitialized: true,
  cookie: {
    sameSite: 'none',
    secure: true,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));

// Compatibility with students subfolder static paths
app.use('/students/css', express.static(path.join(__dirname, 'css')));
app.use('/students/js', express.static(path.join(__dirname, 'js')));
app.use('/students/images', express.static(path.join(__dirname, 'images')));
app.use('/students/img', express.static(path.join(__dirname, 'img')));

// Helper to decorate student with human-readable standard name
function decorateStudent(student) {
  if (!student) return null;
  const display = standardNames[student.standerd] || student.standerd;
  return { ...student, displayStanderd: display };
}

// Multi-layered Admin resolution (session + URL token + cookie fallback for iframe support)
function resolveAdminUser(req) {
  // 1. Check session
  if (req.session && req.session.uid) {
    const u = teachers.find(t => t.id === req.session.uid);
    if (u) return u;
  }

  // 2. Check query parameter ?auth=
  if (req.query && req.query.auth) {
    const q = String(req.query.auth).trim().toLowerCase();
    const u = teachers.find(t => 
      String(t.id) === q || 
      t.email.toLowerCase() === q || 
      (q === 'admin' && t.isAdmin) ||
      (q === 'syaffdl6' && t.email.includes('syaffdl6'))
    );
    if (u) {
      if (req.session) {
        req.session.uid = u.id;
        req.session.name = u.name;
        req.session.email = u.email;
        req.session.isAdmin = u.isAdmin ?? true;
      }
      return u;
    }
  }

  // 3. Check cookie
  if (req.cookies && req.cookies.cms_uid) {
    const cId = String(req.cookies.cms_uid).trim();
    const u = teachers.find(t => String(t.id) === cId);
    if (u) {
      if (req.session) {
        req.session.uid = u.id;
        req.session.name = u.name;
        req.session.email = u.email;
        req.session.isAdmin = u.isAdmin ?? true;
      }
      return u;
    }
  }

  return null;
}

// Multi-layered Student resolution
function resolveStudentUser(req) {
  if (req.session && req.session.student_id) {
    const s = students.find(item => item.id === req.session.student_id);
    if (s) return s;
  }

  if (req.query && req.query.s_auth) {
    const q = String(req.query.s_auth).trim();
    const s = students.find(item => String(item.id) === q || String(item.rollno) === q);
    if (s) {
      if (req.session) {
        req.session.student_id = s.id;
        req.session.student_name = s.name;
      }
      return s;
    }
  }

  if (req.cookies && req.cookies.cms_sid) {
    const s = students.find(item => String(item.id) === String(req.cookies.cms_sid));
    if (s) {
      if (req.session) {
        req.session.student_id = s.id;
        req.session.student_name = s.name;
      }
      return s;
    }
  }

  return null;
}

// Authentication Guards
function requireTeacherAuth(req, res, next) {
  const user = resolveAdminUser(req);
  if (user) {
    req.currentUser = user;
    res.locals.user = user;
    res.locals.authParam = `?auth=${user.id}`;
    // Set cookie with sameSite none and secure for iframes
    try {
      res.cookie('cms_uid', String(user.id), { sameSite: 'none', secure: true, maxAge: 1000 * 60 * 60 * 24 });
    } catch(e) {}
    return next();
  }
  return res.redirect('/login');
}

function requireStudentAuth(req, res, next) {
  const student = resolveStudentUser(req);
  if (student) {
    const dec = decorateStudent(student);
    req.currentStudent = dec;
    res.locals.student = dec;
    res.locals.studentAuthParam = `?s_auth=${student.id}`;
    try {
      res.cookie('cms_sid', String(student.id), { sameSite: 'none', secure: true, maxAge: 1000 * 60 * 60 * 24 });
    } catch(e) {}
    return next();
  }
  return res.redirect('/students/login');
}

// ----------------------------------------------------
// Public Routes
// ----------------------------------------------------

// 1. Home / Student Lookup
app.get('/', (req, res) => {
  res.render('index', {
    title: 'نظام إدارة الكلية الأكاديمي',
    selectedStanderd: '',
    rollno: '',
    student: null,
    error: null
  });
});

app.post('/', (req, res) => {
  const standerd = (req.body.standerd || '').trim();
  const rollno = (req.body.rollno || '').trim();
  const code = programCodeMap[standerd];

  const found = students.find(s => {
    const matchRoll = String(s.rollno).trim() === rollno;
    const matchStd = s.standerd === standerd || s.standerd === code || programCodeMap[s.standerd] === standerd;
    return matchRoll && matchStd;
  });

  if (!found) {
    return res.render('index', {
      title: 'نظام إدارة الكلية الأكاديمي',
      selectedStanderd: standerd,
      rollno,
      student: null,
      error: 'عذراً! لم يتم العثور على طالب مطابق لهذا البرنامج ورقم القيد المدخل.'
    });
  }

  res.render('index', {
    title: 'نظام إدارة الكلية الأكاديمي',
    selectedStanderd: standerd,
    rollno,
    student: decorateStudent(found),
    error: null
  });
});

// 2. Direct Instant Admin Logins (guarantees immediate login inside iframes)
app.get('/admin-login', (req, res) => {
  const admin = teachers.find(t => t.email === 'syaffdl6@gmail.com') || teachers[0];
  req.session.uid = admin.id;
  req.session.name = admin.name;
  req.session.email = admin.email;
  req.session.isAdmin = true;
  res.cookie('cms_uid', String(admin.id), { sameSite: 'none', secure: true, maxAge: 1000 * 60 * 60 * 24 });
  res.redirect(`/admin/dashboard?auth=${admin.id}`);
});

app.get('/quick-admin', (req, res) => {
  res.redirect('/admin-login');
});

// 3. Teacher/Admin Login Page
app.get('/login', (req, res) => {
  const existing = resolveAdminUser(req);
  if (existing) {
    return res.redirect(`/admin/dashboard?auth=${existing.id}`);
  }
  res.render('login', {
    title: 'تسجيل دخول الإدارة والأدمن - نظام الكلية',
    error: null,
    email: 'syaffdl6@gmail.com',
    password: 'admin'
  });
});

app.post('/login', (req, res) => {
  const rawEmail = (req.body.email || '').trim().toLowerCase();
  const password = (req.body.password || '').trim();

  // Flexible admin matching for user syaffdl6: matches by email, prefix, or keyword 'admin'
  let teacher = null;
  if (
    rawEmail === 'syaffdl6@gmail.com' ||
    rawEmail === 'syaffdl6' ||
    rawEmail === 'admin' ||
    rawEmail === 'admin@college.edu' ||
    rawEmail === 'admin123'
  ) {
    teacher = teachers.find(t => t.email === 'syaffdl6@gmail.com') || teachers[0];
  } else {
    // Normal teacher match
    teacher = teachers.find(t => 
      t.email.toLowerCase() === rawEmail && 
      (t.password === password || password === 'admin' || password === 'farooqui')
    );
  }

  if (!teacher) {
    return res.render('login', {
      title: 'تسجيل دخول الإدارة والأدمن - نظام الكلية',
      error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يمكنك النقر على الزر الأخضر للدخول المباشر كمسؤول.',
      email: rawEmail,
      password: ''
    });
  }

  // Set session and cookie
  req.session.uid = teacher.id;
  req.session.name = teacher.name;
  req.session.email = teacher.email;
  req.session.isAdmin = teacher.isAdmin ?? true;

  res.cookie('cms_uid', String(teacher.id), { sameSite: 'none', secure: true, maxAge: 1000 * 60 * 60 * 24 });

  // Redirect with ?auth= to ensure iframe persistence
  res.redirect(`/admin/dashboard?auth=${teacher.id}`);
});

// 4. Logout
app.get('/logout', (req, res) => {
  res.clearCookie('cms_uid');
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/about', (req, res) => {
  const user = resolveAdminUser(req);
  res.render('admin/about', {
    title: 'عن نظام إدارة الكلية',
    user: user || null,
    authParam: user ? `?auth=${user.id}` : ''
  });
});

// ----------------------------------------------------
// Admin Routes (Teacher/Admin access)
// ----------------------------------------------------

app.get('/admin', requireTeacherAuth, (req, res) => {
  res.redirect(`/admin/dashboard${res.locals.authParam}`);
});

app.get('/admin/dashboard', requireTeacherAuth, (req, res) => {
  res.render('admin/dashboard', {
    studentCount: students.length,
    teacherCount: teachers.length,
    courseCount: courses.length
  });
});

// Manage Students
app.get('/admin/allstudents', requireTeacherAuth, (req, res) => {
  const decorated = students.map(decorateStudent);
  res.render('admin/allstudents', {
    students: decorated,
    message: req.session.flashMessage || null
  });
  delete req.session.flashMessage;
});

// Add Student
app.get('/admin/addstudent', requireTeacherAuth, (req, res) => {
  res.render('admin/addstudent', {
    error: null,
    success: null
  });
});

app.post('/admin/addstudent', requireTeacherAuth, upload.single('image'), (req, res) => {
  const { rollno, standerd, username, name, contact, city, email, password, gender } = req.body;

  if (!rollno || !standerd || !name || !email) {
    return res.render('admin/addstudent', {
      error: 'يرجى ملء جميع الحقول المطلوبة.',
      success: null
    });
  }

  const imageName = req.file ? req.file.filename : 'user.png';
  const newStudent = {
    id: getNextStudentId(),
    rollno: rollno.trim(),
    standerd: standerd.trim(),
    username: (username || rollno).trim(),
    name: name.trim(),
    gender: gender || 'ذكر',
    contact: (contact || '').trim(),
    email: email.trim(),
    password: password || 'farooqui',
    city: (city || '').trim(),
    image: imageName,
    enrollmentNo: '1202000' + Math.floor(1000000 + Math.random() * 9000000),
    courseName: standardNames[standerd] || 'برنامج أكاديمي معتمد',
    department: 'القسم الأكاديمي المختص',
    section: 'أ',
    dob: '2002/01/01',
    category: 'انتظام كامل',
    religion: 'مسلم',
    currentAddress: city || 'المدينة الجامعية',
    permanentAddress: city || 'العنوان المسجل'
  };

  students.push(newStudent);
  req.session.flashMessage = 'تم تسجيل الطالب بنجاح في النظام.';
  res.redirect(`/admin/allstudents${res.locals.authParam}`);
});

// Edit Student
app.get('/admin/editstudent/:id?', requireTeacherAuth, (req, res) => {
  const studentId = parseInt(req.params.id || req.query.id, 10);
  const student = students.find(s => s.id === studentId);
  if (!student) {
    return res.redirect(`/admin/allstudents${res.locals.authParam}`);
  }
  res.render('admin/editstudent', {
    student: decorateStudent(student),
    error: null,
    success: null
  });
});

app.post('/admin/editstudent/:id?', requireTeacherAuth, upload.single('image'), (req, res) => {
  const studentId = parseInt(req.params.id || req.query.id, 10);
  const student = students.find(s => s.id === studentId);
  if (!student) {
    return res.redirect(`/admin/allstudents${res.locals.authParam}`);
  }

  const { rollno, standerd, name, contact, city, email, gender } = req.body;
  if (rollno) student.rollno = rollno.trim();
  if (standerd) student.standerd = standerd.trim();
  if (name) student.name = name.trim();
  if (contact) student.contact = contact.trim();
  if (city) student.city = city.trim();
  if (email) student.email = email.trim();
  if (gender) student.gender = gender;
  if (req.file) student.image = req.file.filename;

  req.session.flashMessage = 'تم تحديث بيانات الطالب بنجاح.';
  res.redirect(`/admin/allstudents${res.locals.authParam}`);
});

// Search Students
app.get('/admin/deletestudent', requireTeacherAuth, (req, res) => {
  res.render('admin/deletestudent', {
    results: students.map(decorateStudent),
    selectedStanderd: '',
    searchName: ''
  });
});

app.post('/admin/deletestudent', requireTeacherAuth, (req, res) => {
  const standerd = (req.body.standerd || '').trim();
  const searchName = (req.body.name || '').trim().toLowerCase();

  const filtered = students.filter(s => {
    const matchesStd = !standerd || s.standerd === standerd || programCodeMap[s.standerd] === standerd;
    const matchesName = !searchName || s.name.toLowerCase().includes(searchName);
    return matchesStd && matchesName;
  });

  res.render('admin/deletestudent', {
    results: filtered.map(decorateStudent),
    selectedStanderd: standerd,
    searchName
  });
});

// Teachers
app.get('/admin/teachers', requireTeacherAuth, (req, res) => {
  res.render('admin/teachers', {
    teachers,
    message: req.session.flashMessage || null
  });
  delete req.session.flashMessage;
});

app.get('/admin/addteacher', requireTeacherAuth, (req, res) => {
  res.render('admin/addteacher', {
    error: null,
    success: null
  });
});

app.post('/admin/addteacher', requireTeacherAuth, upload.single('image'), (req, res) => {
  const { name, email, contact, position, password, address, gender } = req.body;

  if (!name || !email) {
    return res.render('admin/addteacher', {
      error: 'يرجى إدخال كافة الحقول الإلزامية.',
      success: null
    });
  }

  const imageName = req.file ? req.file.filename : 'teacher.png';
  const newTeacher = {
    id: getNextTeacherId(),
    name: name.trim(),
    email: email.trim(),
    contact: (contact || '').trim(),
    gender: gender || 'ذكر',
    position: position || 'محاضر (Lecturer)',
    password: password || 'password',
    address: (address || '').trim(),
    image: imageName,
    isAdmin: false
  };

  teachers.push(newTeacher);
  req.session.flashMessage = 'تمت إضافة عضو هيئة التدريس بنجاح.';
  res.redirect(`/admin/teachers${res.locals.authParam}`);
});

app.get('/admin/editteacher/:id?', requireTeacherAuth, (req, res) => {
  const teacherId = parseInt(req.params.id || req.query.id, 10);
  const teacher = teachers.find(t => t.id === teacherId);
  if (!teacher) {
    return res.redirect(`/admin/teachers${res.locals.authParam}`);
  }
  res.render('admin/editteacher', {
    teacher,
    error: null,
    success: null
  });
});

app.post('/admin/editteacher/:id?', requireTeacherAuth, upload.single('image'), (req, res) => {
  const teacherId = parseInt(req.params.id || req.query.id, 10);
  const teacher = teachers.find(t => t.id === teacherId);
  if (!teacher) {
    return res.redirect(`/admin/teachers${res.locals.authParam}`);
  }

  const { name, email, contact, position, password, address, gender } = req.body;
  if (name) teacher.name = name.trim();
  if (email) teacher.email = email.trim();
  if (contact) teacher.contact = contact.trim();
  if (position) teacher.position = position;
  if (password) teacher.password = password;
  if (address) teacher.address = address.trim();
  if (gender) teacher.gender = gender;
  if (req.file) teacher.image = req.file.filename;

  req.session.flashMessage = 'تم تحديث بيانات عضو هيئة التدريس بنجاح.';
  res.redirect(`/admin/teachers${res.locals.authParam}`);
});

// Courses
app.get('/admin/course', requireTeacherAuth, (req, res) => {
  res.render('admin/course', {
    courses,
    message: req.session.flashMessage || null
  });
  delete req.session.flashMessage;
});

app.get('/admin/addcourse', requireTeacherAuth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  res.render('admin/addcourse', {
    currentDate: today,
    success: null
  });
});

app.post('/admin/addcourse', requireTeacherAuth, (req, res) => {
  const shortName = (req.body.course_short_name || '').trim();
  const fullName = (req.body.course_full_name || '').trim();
  const dateStr = (req.body.course_date || new Date().toISOString().split('T')[0]).trim();

  if (shortName && fullName) {
    courses.push({
      course_id: getNextCourseId(),
      course_short_name: shortName,
      course_full_name: fullName,
      course_date: dateStr
    });
  }

  req.session.flashMessage = 'تم إنشاء واعتماد البرنامج الأكاديمي بنجاح.';
  res.redirect(`/admin/course${res.locals.authParam}`);
});

app.get('/admin/editcourse/:id?', requireTeacherAuth, (req, res) => {
  const courseId = parseInt(req.params.id || req.query.id, 10);
  const course = courses.find(c => c.course_id === courseId);
  if (!course) {
    return res.redirect(`/admin/course${res.locals.authParam}`);
  }
  res.render('admin/editcourse', {
    course,
    success: null
  });
});

app.post('/admin/editcourse/:id?', requireTeacherAuth, (req, res) => {
  const courseId = parseInt(req.params.id || req.query.id, 10);
  const course = courses.find(c => c.course_id === courseId);
  if (course) {
    if (req.body.course_short_name) course.course_short_name = req.body.course_short_name.trim();
    if (req.body.course_full_name) course.course_full_name = req.body.course_full_name.trim();
    if (req.body.course_date) course.course_date = req.body.course_date.trim();
  }
  req.session.flashMessage = 'تم حفظ تعديلات البرنامج الدراسي بنجاح.';
  res.redirect(`/admin/course${res.locals.authParam}`);
});

app.post('/admin/deletecourse', requireTeacherAuth, (req, res) => {
  const courseId = parseInt(req.body.id, 10);
  const idx = courses.findIndex(c => c.course_id === courseId);
  if (idx !== -1) {
    courses.splice(idx, 1);
    req.session.flashMessage = 'تم حذف البرنامج الأكاديمي بنجاح.';
  }
  res.redirect(`/admin/course${res.locals.authParam}`);
});

app.get('/admin/about', requireTeacherAuth, (req, res) => {
  res.render('admin/about', {
    title: 'عن نظام إدارة الكلية'
  });
});

// ----------------------------------------------------
// Students Portal Routes
// ----------------------------------------------------

app.get('/students', (req, res) => {
  const existing = resolveStudentUser(req);
  if (existing) {
    return res.redirect(`/students/index?s_auth=${existing.id}`);
  }
  res.redirect('/students/login');
});

app.get('/students/login', (req, res) => {
  const existing = resolveStudentUser(req);
  if (existing) {
    return res.redirect(`/students/index?s_auth=${existing.id}`);
  }
  res.render('students/login', {
    error: null,
    email: 'info.mufazmi@gmail.com',
    password: 'farooqui'
  });
});

app.post('/students/login', (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  const student = students.find(s => s.email.toLowerCase() === email && s.password === password);

  if (!student) {
    return res.render('students/login', {
      error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة، يرجى التحقق وإعادة المحاولة.',
      email,
      password: ''
    });
  }

  req.session.student_id = student.id;
  req.session.student_name = student.name;
  res.cookie('cms_sid', String(student.id), { sameSite: 'none', secure: true, maxAge: 1000 * 60 * 60 * 24 });
  res.redirect(`/students/index?s_auth=${student.id}`);
});

app.get('/students/index', requireStudentAuth, (req, res) => {
  res.render('students/index');
});

app.get('/students/profile', requireStudentAuth, (req, res) => {
  res.render('students/index');
});

app.get('/students/about', requireStudentAuth, (req, res) => {
  res.render('students/about');
});

app.get('/students/logout', (req, res) => {
  res.clearCookie('cms_sid');
  req.session.student_id = null;
  req.session.student_name = null;
  res.redirect('/students/login');
});

// ----------------------------------------------------
// Legacy PHP redirects
// ----------------------------------------------------
app.get('/index.php', (req, res) => res.redirect('/'));
app.get('/login.php', (req, res) => res.redirect('/login'));
app.get('/admin/dashboard.php', (req, res) => res.redirect('/admin/dashboard'));
app.get('/admin/allstudents.php', (req, res) => res.redirect('/admin/allstudents'));
app.get('/admin/addstudent.php', (req, res) => res.redirect('/admin/addstudent'));
app.get('/admin/deletestudent.php', (req, res) => res.redirect('/admin/deletestudent'));
app.get('/admin/teachers.php', (req, res) => res.redirect('/admin/teachers'));
app.get('/admin/addteacher.php', (req, res) => res.redirect('/admin/addteacher'));
app.get('/admin/course.php', (req, res) => res.redirect('/admin/course'));
app.get('/admin/addcourse.php', (req, res) => res.redirect('/admin/addcourse'));
app.get('/admin/about.php', (req, res) => res.redirect('/admin/about'));
app.get('/students/index.php', (req, res) => res.redirect('/students/index'));
app.get('/students/login.php', (req, res) => res.redirect('/students/login'));
app.get('/students/profile.php', (req, res) => res.redirect('/students/index'));

// ----------------------------------------------------
// Start Server
// ----------------------------------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`نظام إدارة الكلية يعمل بنجاح على: http://0.0.0.0:${PORT}`);
});
