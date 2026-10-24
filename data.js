// In-memory data store with Arabic labels and Admin support

export const programCodeMap = {
  '1': 'بكالوريوس هندسة الحاسوب والتكنولوجيا',
  '2': 'بكالوريوس إدارة أعمال',
  '3': 'بكالوريوس نظم معلومات وتطبيقات الحاسب',
  '4': 'ماجستير إدارة الأعمال',
  '5': 'ماجستير تطبيقات الحاسوب',
  '6': 'ماجستير تقنية المعلومات',
  'Btech': '1',
  'BBA': '2',
  'BCA': '3',
  'MBA': '4',
  'MCA': '5',
  'Mtech': '6'
};

export const standardNames = {
  '1': 'بكالوريوس هندسة الحاسوب والتكنولوجيا (B.Tech)',
  '2': 'بكالوريوس إدارة أعمال (BBA)',
  '3': 'بكالوريوس نظم وتطبيقات الحاسب (BCA)',
  '4': 'ماجستير إدارة الأعمال (MBA)',
  '5': 'ماجستير تطبيقات الحاسوب (MCA)',
  '6': 'ماجستير تقنية المعلومات (M.Tech)',
  'Btech': 'بكالوريوس هندسة الحاسوب والتكنولوجيا (B.Tech)',
  'BBA': 'بكالوريوس إدارة أعمال (BBA)',
  'BCA': 'بكالوريوس نظم وتطبيقات الحاسب (BCA)',
  'MBA': 'ماجستير إدارة الأعمال (MBA)',
  'MCA': 'ماجستير تطبيقات الحاسوب (MCA)',
  'Mtech': 'ماجستير تقنية المعلومات (M.Tech)'
};

export const courses = [
  { course_id: 44, course_short_name: 'ماجستير حاسوب (MCA)', course_full_name: 'ماجستير في تطبيقات الحاسوب وتطوير البرمجيات', course_date: '2024-09-01' },
  { course_id: 45, course_short_name: 'ماجستير علوم (M.Sc)', course_full_name: 'ماجستير في علوم البيانات والذكاء الاصطناعي', course_date: '2024-09-01' },
  { course_id: 46, course_short_name: 'بكالوريوس تجارة (B.Com)', course_full_name: 'بكالوريوس العلوم المالية والمصرفية', course_date: '2024-09-01' },
  { course_id: 48, course_short_name: 'ماجستير إدارة (MBA)', course_full_name: 'ماجستير إدارة الأعمال والقيادة التنفيذية', course_date: '2024-09-01' }
];

export const teachers = [
  {
    id: 10,
    name: 'سياف (المدير العام)',
    email: 'syaffdl6@gmail.com',
    contact: '0501234567',
    gender: 'male',
    position: 'مدير النظام والعميد (Super Admin)',
    password: 'admin',
    address: 'مبنى رئاسة الكلية - الرياض',
    image: 'mufazmi.png',
    isAdmin: true
  },
  {
    id: 1,
    name: 'أ. د. عمير فاروقي',
    email: 'info.mufazmi@gmail.com',
    contact: '0559867503',
    gender: 'male',
    position: 'مدير الشؤون الأكاديمية (Manager)',
    password: 'farooqui',
    address: 'حي الورود - مبنى أعضاء هيئة التدريس',
    image: 'mufazmi.png',
    isAdmin: true
  },
  {
    id: 8,
    name: 'د. فردوس فاروقي',
    email: 'firdosfatima.it@gmail.com',
    contact: '0557236901',
    gender: 'female',
    position: 'رئيسة قسم الحاسب وتقنية المعلومات',
    password: 'abbasi',
    address: 'حي النخيل - الرياض',
    image: 'firdos.jpg',
    isAdmin: false
  },
  {
    id: 99,
    name: 'أ. ريتشانا سينغ',
    email: 'rachanasingh4888@gmail.com',
    contact: '0558233366',
    gender: 'female',
    position: 'مسؤول القبول والتسجيل (Admin)',
    password: 'rachana',
    address: 'عمادة القبول والتسجيل',
    image: 'user.png',
    isAdmin: true
  }
];

export const students = [
  {
    id: 20,
    rollno: '1',
    standerd: '3',
    username: 'mufazmi',
    name: 'عمير فاروقي',
    gender: 'ذكر',
    contact: '0559867503',
    email: 'info.mufazmi@gmail.com',
    password: 'farooqui',
    city: 'الرياض',
    image: 'mufazmi.png',
    enrollmentNo: '12020002017044',
    courseName: 'بكالوريوس نظم وتطبيقات الحاسب',
    department: 'قسم هندسة البرمجيات والذكاء الاصطناعي',
    section: 'أ (A)',
    dob: '2001/11/15',
    category: 'انتظام كامل',
    religion: 'مسلم',
    currentAddress: 'حي الياسمين، الرياض',
    permanentAddress: 'حي الياسمين، الرياض'
  },
  {
    id: 21,
    rollno: '2',
    standerd: '2',
    username: 'firdos',
    name: 'فردوس عباسي',
    gender: 'أنثى',
    contact: '0559867503',
    email: 'firdosfatima.it@gmail.com',
    password: 'farooqui',
    city: 'جدة',
    image: 'firdos.jpg',
    enrollmentNo: '12020002017045',
    courseName: 'بكالوريوس إدارة أعمال',
    department: 'قسم إدارة الأعمال والتسويق',
    section: 'أ (A)',
    dob: '2002/04/08',
    category: 'منحة تفوق',
    religion: 'مسلم',
    currentAddress: 'حي الروضة، جدة',
    permanentAddress: 'حي الروضة، جدة'
  },
  {
    id: 22,
    rollno: '6',
    standerd: '3',
    username: 'sajid',
    name: 'ساجد فاروقي',
    gender: 'ذكر',
    contact: '0558268400',
    email: 'sajidfarooqui82@gmail.com',
    password: 'farooqui',
    city: 'الدمام',
    image: '6.jpg',
    enrollmentNo: '12020002017046',
    courseName: 'بكالوريوس نظم وتطبيقات الحاسب',
    department: 'قسم شبكات الحاسوب والأمن السيبراني',
    section: 'ب (B)',
    dob: '2001/09/12',
    category: 'انتظام',
    religion: 'مسلم',
    currentAddress: 'حي الشاطئ، الدمام',
    permanentAddress: 'حي الشاطئ، الدمام'
  },
  {
    id: 27,
    rollno: '10',
    standerd: '1',
    username: 'ibbu',
    name: 'إبراهيم عمادي',
    gender: 'ذكر',
    contact: '0559920322',
    email: 'info.ibraheemimadi@gmail.com',
    password: 'farooqui',
    city: 'مكة المكرمة',
    image: 'user.png',
    enrollmentNo: '12020002017047',
    courseName: 'بكالوريوس هندسة الحاسوب والتكنولوجيا',
    department: 'قسم الهندسة الكهربائية والحاسوب',
    section: 'أ (A)',
    dob: '2002/01/20',
    category: 'انتظام',
    religion: 'مسلم',
    currentAddress: 'حي العزيزية، مكة المكرمة',
    permanentAddress: 'حي العزيزية، مكة المكرمة'
  }
];

let nextStudentId = 30;
let nextTeacherId = 101;
let nextCourseId = 50;

export function getNextStudentId() {
  return nextStudentId++;
}

export function getNextTeacherId() {
  return nextTeacherId++;
}

export function getNextCourseId() {
  return nextCourseId++;
}
