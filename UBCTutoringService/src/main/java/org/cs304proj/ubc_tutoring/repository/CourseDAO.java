package org.cs304proj.ubc_tutoring.repository;


import org.cs304proj.ubc_tutoring.domain.Course;
import org.cs304proj.ubc_tutoring.domain.CourseStat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CourseDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private List<Course> courseList = new ArrayList<>();

    public void updateAvailableCourses() {
        courseList = jdbcTemplate.query(
                "select * from course;",
                (rs, rowNum) -> new Course(rs.getString(1), rs.getInt(2),
                        rs.getString(3)));
    }

    public List<String> getSubjectNames() {
        List<String> subjectNames = new ArrayList<>();
        for (Course course : courseList) {
            String name = course.getSubject();

            if (!subjectNames.contains(name)) {
                subjectNames.add(name);
            }
        }
        return subjectNames;
    }

    public List<Integer> getCourseNumFromSubject(String subject) {
        List<Integer> courseNums = new ArrayList<>();

        for (Course course : courseList) {
            if (course.getSubject().equals(subject)) {
                courseNums.add(course.getCourse_number());
            }
        }
        return courseNums;
    }

    public List<Integer> getSpecificTutorCourseNumber(int tutor_id, String subject) {
        List<Course> courses = jdbcTemplate.query(
                "select course.* from course\n" +
                        "join tutorcanteach on tutorcanteach.subject = course.subject and tutorcanteach.course_number = course.course_number\n" +
                        "where tutorcanteach.tutor_id = ? and course.subject = ?",
                new Object[]{tutor_id, subject},
                (rs, rowNum) -> new Course(rs.getString(1), rs.getInt(2),
                        rs.getString(3)));

        List<Integer> courseNumList = new ArrayList<>();
        for (Course course : courses) {
            int courseNum = course.getCourse_number();
            courseNumList.add(courseNum);
        }

        return courseNumList;
    }

    public List<CourseStat> getCourseStats() {
        return jdbcTemplate.query(
                "select subject, count(*) as count from appointment group by subject",
                (rs, rowNum) -> new CourseStat(
                        rs.getString("subject"),
                        rs.getInt("count")
                ));
    }

}
