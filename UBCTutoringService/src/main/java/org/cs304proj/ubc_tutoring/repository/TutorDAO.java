package org.cs304proj.ubc_tutoring.repository;


import org.cs304proj.ubc_tutoring.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class TutorDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private int tutorID;
    private String degree;
    private String status;
    private float gpa;
    private String bio;

    public List<TutorAvailable> getTutorAvailability() {

        return jdbcTemplate.query(
                "SELECT start_datetime,  end_datetime FROM TutorAvailable where tutor_id = ?",
                new Object[]{tutorID},
                (rs, rowNum) -> new TutorAvailable(rs.getString("start_datetime"),
                        rs.getString("end_datetime")));
    }

    public List<TutorAvailable> getTutorAvailability(int tutor_id) {

        return jdbcTemplate.query(
                "SELECT start_datetime,  end_datetime FROM TutorAvailable where tutor_id = ?",
                new Object[]{tutor_id},
                (rs, rowNum) -> new TutorAvailable(rs.getString("start_datetime"),
                        rs.getString("end_datetime")));
    }

    public void addTutorAvailability(LocalDateTime startDate, LocalDateTime endDate) {
        jdbcTemplate.update(
                "INSERT into TutorAvailable VALUES(?, ?, ?)",
                tutorID, startDate, endDate
                );
    }

    // set tutor info for profile viewing
    public void getTutorInfo(String username) {
        List<Tutor> tutorList = jdbcTemplate.query(
                "select * FROM tutor where username = ?",
                new String[]{username},
                (rs, rowNum) -> new Tutor(rs.getInt(1), rs.getString(2),
                                    rs.getString(3), rs.getString(4),
                                    rs.getFloat(5), rs.getString(6)));

        Tutor tutor = tutorList.get(0);
        this.tutorID = tutor.getTutor_id();
        this.degree = tutor.getDegree();
        this.status = tutor.getStatus();
        this.gpa = tutor.getGpa();
        this.bio = tutor.getBio();
    }

    public void saveTutorProfile(String degree, String status, float gpa, String bio) {
        jdbcTemplate.update(
                "UPDATE tutor SET degree = ?, status = ?, gpa = ?, bio = ? WHERE tutor_id = ?",
                degree, status, gpa, bio, this.tutorID
        );
    }

    public void deleteTutorAvailability(LocalDateTime start, LocalDateTime end) {
        jdbcTemplate.update(
                "DELETE from tutorAvailable WHERE tutor_id = ? and start_datetime = ? and end_datetime = ?",
                this.tutorID, start, end
        );
    }

    public List<TutorAppointment> getAppointments() {
        return jdbcTemplate.query(
                "select user.full_name as Student, Subject, CourseNumber, Building, Room, Start, End\n" +
                        "from virtual_appointment\n" +
                        "join user on virtual_appointment.StudentUser = user.username\n" +
                        "where virtual_appointment.tutor_id = ? and appointment_id not in (select session.appointment_id from session);",
                new Object[]{tutorID},
                (rs, rowNum) -> new TutorAppointment(rs.getString("Student"),
                        rs.getString("Subject"),
                        rs.getInt("CourseNumber"),
                        rs.getString("Building"),
                        rs.getString("Room"),
                        rs.getString("Start"),
                        rs.getString("End")
                        ));
    }

    public List<TutorAppointment> getSessions() {
        return jdbcTemplate.query(
                "select user.full_name as Student, Subject, CourseNumber, Building, Room, Start, End\n" +
                        "from session\n" +
                        "join virtual_appointment on session.appointment_id = virtual_appointment.appointment_id\n" +
                        "join user on virtual_appointment.StudentUser = user.username\n" +
                        "where virtual_appointment.tutor_id = ?;",
                new Object[]{tutorID},
                (rs, rowNum) -> new TutorAppointment(rs.getString("Student"),
                        rs.getString("Subject"),
                        rs.getInt("CourseNumber"),
                        rs.getString("Building"),
                        rs.getString("Room"),
                        rs.getString("Start"),
                        rs.getString("End")
                ));
    }

    public List<CourseTutor> getTutorsByCourse(String subject) {
        return jdbcTemplate.query(
                "select distinct user.full_name, tutor.degree, tutor.status, tutor.gpa, tutor.bio, tutor.tutor_id from tutor\n" +
                        "join user on user.username = tutor.username\n" +
                        "join tutorcanteach on tutorcanteach.tutor_id = tutor.tutor_id\n" +
                        "where tutorcanteach.subject = ?;",
                new String[]{subject},
                (rs, rowNum) -> new CourseTutor(rs.getString("full_name"),
                        rs.getString("degree"),
                        rs.getString("status"),
                        rs.getFloat("gpa"),
                        rs.getString("bio"),
                        rs.getInt("tutor_id")
                ));
    }

    public List<TutorCanTeach> getCourses() {
        return jdbcTemplate.query(
                "select * from TutorCanTeach where tutor_id = ?;",
                new Object[]{tutorID},
                (rs, rowNum) -> new TutorCanTeach(rs.getInt("tutor_id"),
                        rs.getInt("course_number"),
                        rs.getString("subject")));
    }

    public void addTutorCanTeach(int courseNum, String subject) {
        jdbcTemplate.update(
                "INSERT into TutorCanTeach VALUES(?, ?, ?)",
                tutorID, courseNum, subject);
    }



    public String getDegree() {
        return degree;
    }

    public String getStatus() {
        return status;
    }

    public float getGpa() {
        return gpa;
    }

    public String getBio() {
        return bio;
    }
}
