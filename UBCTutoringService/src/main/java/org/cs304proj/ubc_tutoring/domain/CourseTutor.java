package org.cs304proj.ubc_tutoring.domain;

public class CourseTutor {
    private String full_name;
    private String degree;
    private String status;
    private float gpa;
    private String bio;
    private int id;

    public CourseTutor(String full_name, String degree, String status, float gpa, String bio, int id) {
        this.full_name = full_name;
        this.degree = degree;
        this.status = status;
        this.gpa = gpa;
        this.bio = bio;
        this.id = id;
    }

    public String getFull_name() {
        return full_name;
    }

    public void setFull_name(String full_name) {
        this.full_name = full_name;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public float getGpa() {
        return gpa;
    }

    public void setGpa(float gpa) {
        this.gpa = gpa;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}
