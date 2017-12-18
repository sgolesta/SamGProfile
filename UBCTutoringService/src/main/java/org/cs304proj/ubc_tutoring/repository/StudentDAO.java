package org.cs304proj.ubc_tutoring.repository;


import org.cs304proj.ubc_tutoring.domain.Course;
import org.cs304proj.ubc_tutoring.domain.Room;
import org.cs304proj.ubc_tutoring.domain.Student;
import org.cs304proj.ubc_tutoring.domain.StudentAppointment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class StudentDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private int studentID;
    private String degree;
    private String needs;

    // Put embedded SQL queries for students here, using jdbcTemplate.
    // set student info for profile viewing
    public void getStudentInfo(String username) {
        List<Student> tutorList = jdbcTemplate.query(
                "select * FROM student where username = ?",
                new String[]{username},
                (rs, rowNum) -> new Student(rs.getInt(1), rs.getString(2),
                        rs.getString(3), rs.getString(4)));

        Student tutor = tutorList.get(0);
        this.studentID = tutor.getStudent_id();
        this.degree = tutor.getDegree();
        this.needs = tutor.getNeeds();
    }

    public void bookStudentAppointment(int tutorId, String subject, int courseNum, int locationId, String startTime, String endTime) {
        jdbcTemplate.update(
                "INSERT into appointment VALUES(null, ?, ?, ?, ?, ?, ?, ?)",
                studentID, tutorId, locationId, subject, courseNum, startTime, endTime);
    }

    public List<StudentAppointment> getAppointments() {
        return jdbcTemplate.query(
                "select user.full_name as Student, Subject, CourseNumber, Building, Room, Start, End\n" +
                        "from virtual_appointment\n" +
                        "join user on virtual_appointment.TutorUser = user.username\n" +
                        "where virtual_appointment.student_id = ? and appointment_id not in (select session.appointment_id from session);",
                new Object[]{studentID},
                (rs, rowNum) -> new StudentAppointment(rs.getString("Student"),
                        rs.getString("Subject"),
                        rs.getInt("CourseNumber"),
                        rs.getString("Building"),
                        rs.getString("Room"),
                        rs.getString("Start"),
                        rs.getString("End")
                ));
    }

    public void saveStudentProfile(String degree, String needs) {
            jdbcTemplate.update("UPDATE student SET degree = ?, needs = ? WHERE student_id = ?",
            degree, needs, this.studentID);
    }

    public List<StudentAppointment> getSessions() {
        return jdbcTemplate.query(
                "select user.full_name as Tutor, Subject, CourseNumber, Building, Room, Start, End\n" +
                        "from session\n" +
                        "join virtual_appointment on session.appointment_id = virtual_appointment.appointment_id\n"
                 + "join user on virtual_appointment.TutorUser = user.username\n" +
                        "where virtual_appointment.student_id = ?;",
                new Object[]{studentID},
                (rs, rowNum) -> new StudentAppointment(rs.getString("Tutor"),
                        rs.getString("Subject"),
                        rs.getInt("CourseNumber"),
                        rs.getString("Building"),
                        rs.getString("Room"),
                        rs.getString("Start"),
                        rs.getString("End")
                ));
    }

    public List<Integer> getLocationId() {
        List<Room> roomList = jdbcTemplate.query(
                "select * from room;",
                (rs, rowNum) -> new Room(rs.getInt("location_id"),
                        rs.getString("room_name"),
                        rs.getString("address")
                ));
        List<Integer> idList = new ArrayList<>();

        for (Room room : roomList) {
            idList.add(room.getLocation_id());
        }

        return idList;
    }

    public int getStudentID() {
        return studentID;
    }

    public String getDegree() {
        return degree;
    }

    public String getNeeds() {
        return needs;
    }
}
