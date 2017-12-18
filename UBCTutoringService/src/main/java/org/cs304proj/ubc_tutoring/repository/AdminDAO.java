package org.cs304proj.ubc_tutoring.repository;

import org.cs304proj.ubc_tutoring.domain.Building;
import org.cs304proj.ubc_tutoring.domain.Course;
import org.cs304proj.ubc_tutoring.domain.Room;
import org.cs304proj.ubc_tutoring.domain.Administrator;
import org.cs304proj.ubc_tutoring.domain.Appointment;
import org.cs304proj.ubc_tutoring.domain.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * This repository class handles queries for administrators.
 */
@Component
public class AdminDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final String ADMIN = "Admin";

    /**
     * This method provides data for populating the administrator's
     * default grid with all users.
     * Because virtual_user is a view table, the password column of the table user
     * is hidden, even though all columns are selected.
     * @return list of users of all types found in the collection user
     */
     public List<User> getAllUser() {

         return jdbcTemplate.query(
                 "SELECT * FROM virtual_user",
                 (rs, rowNum) -> new User(rs.getString("username"),
                        rs.getString("full_name"),
                        rs.getString("usertype")));
     }

    public List<Course> getAllCourse() {

        return jdbcTemplate.query(
                "SELECT subject, course_number, course_name FROM course",
                (rs, rowNum) -> new Course(rs.getString("subject"),
                        rs.getInt("course_number"),
                        rs.getString("course_name")));
    }

    public List<Building> getAllBuilding() {

        return jdbcTemplate.query(
                "SELECT building_name, address FROM building",
                (rs, rowNum) -> new Building(rs.getString("address"),
                        rs.getString("building_name")));
    }

    public List<Room> getAllRoom() {
        int room_id = 0;

        return jdbcTemplate.query(
                "SELECT * FROM room",
                (rs, rowNum) -> new Room(room_id, rs.getString("room_name"),
                        rs.getString("address"))
        );
    }

    /**
     * Insert new users created by administrators into the user collection
     * as well as into the table for the appropriate subtype of the user, namely
     * Administrator, Student, or Tutor. Both tables must be updated.
     *
     * @param userName user name of the new instance
     * @param fullName legal name of the user
     * @param password user password
     * @param userType either Administrator, Student, or Tutor
     */
    @Transactional
    public void addNewUser(String userName, String fullName, String password, String userType) {

        final String tableName;
        final String myQuery;

        if(userType.equals(ADMIN)){

            // administrator is abbreviated as Admin
            tableName = "administrator";
        } else {
            tableName = userType.toLowerCase();
        }

        myQuery =  "INSERT INTO " + tableName + " (username) VALUES(?)";

        try {

            // Add the new user to the user table
            jdbcTemplate.update(
                    "INSERT INTO user VALUES(?, ?, ?, ?)",
                    userName,
                    fullName,
                    password,
                    userType
            );

            // Also add the record into the appropriate sub user type table
            // ,i.e. administrator, student, or tutor
            jdbcTemplate.update(
                    myQuery,
                    userName
            );
        } catch(DataAccessException e){

            e.printStackTrace();
        }
    }

    /**
     * This method provides data to populate the grid for administrators with appointments
     * that still need their confirmation.
     *
     * @return list of pending appointments to be approved by an administrator
     */
    public List<Appointment> getAllPendingAppointment(){

        final String myQuery = "SELECT virtual_appointment.appointment_id AS Id, SU.full_name AS StudentName, " +
                                        "TU.full_name AS TutorName, Subject, CourseNumber, Building, Room, Start, End\n" +
                                "FROM virtual_appointment\n" +
                                "JOIN user AS SU ON SU.username = virtual_appointment.StudentUser\n" +
                                "JOIN user AS TU On TU.username = virtual_appointment.TutorUser\n" +
                                "WHERE virtual_appointment.appointment_id NOT IN (SELECT session.appointment_id\n" +
                                                                                  "FROM session)";

        return jdbcTemplate.query(
                   myQuery,
                   (rs, rowNum)-> new Appointment(rs.getInt("Id"),
                                                  null,
                                                  rs.getString("StudentName"),
                                                  rs.getString("TutorName"),
                                                  rs.getString("Subject"),
                                                  rs.getInt("CourseNumber"),
                                                  rs.getString("Building"),
                                                  rs.getString("Room"),
                                                  rs.getDate("Start"),
                                                  rs.getDate("End")
                                                  )
        );
    }

    /**
     * This method is for confirming a pending appointment, inserting the id of the
     * appointment as well as the id of the administrator who processed the record
     * into the session collection. Due to our database design, it is necessary
     * first to access to the administrator collection to find the id of the
     * administrator by his user name. Access to the two collections must succeed.
     *
     * @param appointmentId the unique id of an appointment
     * @param adminName the user name of the administrator
     */
    @Transactional
    public void addSession(String appointmentId, String adminName){

        try {
            // Find administrator's id by his user name first
            List<Administrator> administrators = jdbcTemplate.query(

                    "SELECT admin_id FROM administrator WHERE username = ?",
                    new String[]{adminName},
                    (rs, rowNum) -> new Administrator(rs.getInt("admin_id"))
            );

            Integer adminId = administrators.get(0).getAdminId();
            Integer apptId = Integer.parseInt(appointmentId);

            // Then, use the id to insert a new record into session
            jdbcTemplate.update(

                    "INSERT INTO session VALUES (?, ?)",
                    adminId,
                    apptId
            );
        } catch (DataAccessException e){

            e.printStackTrace();
        }
    }

    /**
     * This is for removing an appointment that has not been confirmed yet.
     * @param appointmentId the unique id of the appointment to be cancelled.
     */
    public void deleteAppointment(Integer appointmentId){

        jdbcTemplate.update(

                "DELETE from appointment WHERE appointment_id = ?",
                appointmentId
        );
    }

    public void addNewCourse(String subject, int course_number, String course_name) {

        jdbcTemplate.update(
                "INSERT into course VALUES(?, ?, ?)",
                subject,
                course_number,
                course_name
        );
    }

    public void deleteCourse(String subject, int course_number) {

        jdbcTemplate.update(
                "DELETE from course WHERE subject = ? and course_number = ?",
                subject, course_number
        );
    }

    public void addNewBuilding(String building_name, String address) {

        jdbcTemplate.update(
                "INSERT into building VALUES(?, ?)",
                address,
                building_name
        );
    }

    public void deleteBuilding(String address) {

        jdbcTemplate.update(
                "DELETE from building WHERE address = ?",
                address
        );
    }

    public void addNewRoom(String room_name, String address) {

        jdbcTemplate.update(
                "INSERT into room VALUES(?, ?, ?)",
                null,
                room_name,
                address
        );
    }

    public void deleteRoom(String room_name) {

        jdbcTemplate.update(
                "DELETE from building WHERE room_name = ?",
                room_name
        );
    }

    /**
     * This methods provides data to populate the session grid for administrators with
     * confirmed appointments. (Session denotes confirmed appointments.) The name of
     * the administrator who approved a given appointment is also returned.
     *
     * @return list of confirmed appointments
     */
    public List<Appointment> getAllConfirmedAppointments(){


        // This is a little awkward query but the use of a view table apparently does not allow invoking another table
        // in FROM, and simply returning session objects would not provide useful information for the user.
        final String myQuery = "SELECT virtual_appointment.appointment_id AS Id, AU.full_name AS AdminName," +
                " SU.full_name AS StudentName, TU.full_name AS TutorName, Subject," +
                " CourseNumber, Building, Room, Start, End\n" +
                "FROM virtual_appointment\n" +
                "JOIN user AS SU ON SU.username = virtual_appointment.StudentUser\n" +
                "JOIN user AS TU On TU.username = virtual_appointment.TutorUser\n" +
                "JOIN session ON session.appointment_id = virtual_appointment.appointment_id\n" +
                "JOIN administrator ON administrator.admin_id = session.admin_id\n" +
                "JOIN user AS AU ON  AU.username = administrator.username";

        return jdbcTemplate.query(

                    myQuery,
                    (rs, rowNum)-> new Appointment(rs.getInt("Id"),
                            rs.getString("AdminName"),
                            rs.getString("StudentName"),
                            rs.getString("TutorName"),
                            rs.getString("Subject"),
                            rs.getInt("CourseNumber"),
                            rs.getString("Building"),
                            rs.getString("Room"),
                            rs.getDate("Start"),
                            rs.getDate("End")
                    )
                );
    }
}
