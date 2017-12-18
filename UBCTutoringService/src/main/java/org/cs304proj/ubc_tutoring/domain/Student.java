package org.cs304proj.ubc_tutoring.domain;

public class Student {
    private int student_id;
    private String username;
    private String degree;
    private String needs;

    public Student(int student_id, String username, String degree, String needs) {
        this.student_id = student_id;
        this.username = username;
        this.degree = degree;
        this.needs = needs;
    }

    public int getStudent_id() {
        return student_id;
    }

    public String getUsername() {
        return username;
    }

    public String getDegree() {
        return degree;
    }

    public String getNeeds() {
        return needs;
    }

    public void setStudent_id(int student_id) {
        this.student_id = student_id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public void setNeeds(String needs) {
        this.needs = needs;
    }
}
