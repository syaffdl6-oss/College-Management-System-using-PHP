-- College Management System: foundation migration
-- Take a backup in phpMyAdmin before running this file. Run it once, after
-- selecting the `sms` database. It preserves the existing rows.

ALTER TABLE admin
  ENGINE = InnoDB,
  MODIFY id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ADD PRIMARY KEY (id),
  ADD UNIQUE KEY uq_admin_email (email);

ALTER TABLE teacher
  ENGINE = InnoDB,
  MODIFY id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  MODIFY password VARCHAR(255) NOT NULL,
  ADD PRIMARY KEY (id),
  ADD UNIQUE KEY uq_teacher_email (email);

ALTER TABLE students
  ENGINE = InnoDB,
  MODIFY id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  MODIFY password VARCHAR(255) NOT NULL,
  ADD PRIMARY KEY (id),
  ADD UNIQUE KEY uq_student_email (email),
  ADD UNIQUE KEY uq_student_username (username),
  ADD UNIQUE KEY uq_student_program_rollno (standerd, rollno);

ALTER TABLE course
  ENGINE = InnoDB,
  MODIFY course_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ADD PRIMARY KEY (course_id),
  ADD UNIQUE KEY uq_course_short_name (course_short_name);

ALTER TABLE posts
  ENGINE = InnoDB,
  MODIFY post_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ADD PRIMARY KEY (post_id),
  ADD KEY idx_posts_author_date (from_user_id, timestamp);

ALTER TABLE follow
  ENGINE = InnoDB,
  MODIFY id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ADD PRIMARY KEY (id),
  ADD UNIQUE KEY uq_follow_relationship (from_user_id, to_user_id);
