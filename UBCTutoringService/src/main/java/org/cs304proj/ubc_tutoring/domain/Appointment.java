package org.cs304proj.ubc_tutoring.domain;

import java.util.Date;

public class Appointment {
    private Integer appointmentId;
    private String adminName;
    private String studentName;
    private String tutorName;
    private String subject;
    private Integer courseNumber;
    private String building;
    private String room;
    private Date start;
    private Date end;

    public Appointment(){}

    public Appointment(Integer appointmentId, String adminName, String studentName, String tutorName, String subject,
                       Integer courseNumber, String building, String room, Date start, Date end){

        this.appointmentId = appointmentId;
        this.adminName = adminName;
        this.studentName = studentName;
        this.tutorName = tutorName;
        this.subject = subject;
        this.courseNumber = courseNumber;
        this.building = building;
        this.room = room;
        this.start = start;
        this.end = end;
    }

    public Integer getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Integer appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getAdminName() {
        return adminName;
    }

    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getTutorName() {
        return tutorName;
    }

    public void setTutorName(String tutorName) {
        this.tutorName = tutorName;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Integer getCourseNumber() {
        return courseNumber;
    }

    public void setCourseNumber(Integer courseNumber) {
        this.courseNumber = courseNumber;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public Date getStart() {
        return start;
    }

    public void setStart(Date start) {
        this.start = start;
    }

    public Date getEnd() {
        return end;
    }

    public void setEnd(Date end) {
        this.end = end;
    }
}
