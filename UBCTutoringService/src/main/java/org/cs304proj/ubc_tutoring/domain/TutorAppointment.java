package org.cs304proj.ubc_tutoring.domain;

public class TutorAppointment {

    private String student;
    private String subject;
    private int courseNum;
    private String building;
    private String room;
    private String startDate;
    private String endDate;

    public TutorAppointment(String student, String subject, int courseNum, String building, String room,
                            String startDate, String endDate) {

        this.student = student;
        this.subject = subject;
        this.courseNum = courseNum;
        this.building = building;
        this.room = room;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public String getStudent() {
        return student;
    }

    public String getSubject() {
        return subject;
    }

    public int getCourseNum() {
        return courseNum;
    }

    public String getBuilding() {
        return building;
    }

    public String getRoom() {
        return room;
    }

    public String getStartDate() {
        return startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setStudent(String student) {
        this.student = student;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public void setCourseNum(int courseNum) {
        this.courseNum = courseNum;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }
}
