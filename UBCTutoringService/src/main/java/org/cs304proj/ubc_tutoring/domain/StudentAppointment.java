package org.cs304proj.ubc_tutoring.domain;

public class StudentAppointment {

    private String tutor;
    private String subject;
    private int courseNum;
    private String building;
    private String room;
    private String startDate;
    private String endDate;

    public StudentAppointment(String tutor, String subject, int courseNum, String building, String room, String startDate, String endDate) {
        this.tutor = tutor;
        this.subject = subject;
        this.courseNum = courseNum;
        this.building = building;
        this.room = room;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public String getTutor() {
        return tutor;
    }

    public void setTutor(String tutor) {
        this.tutor = tutor;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public int getCourseNum() {
        return courseNum;
    }

    public void setCourseNum(int courseNum) {
        this.courseNum = courseNum;
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

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }
}
