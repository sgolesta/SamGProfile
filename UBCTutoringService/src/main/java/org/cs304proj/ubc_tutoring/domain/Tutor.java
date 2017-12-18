package org.cs304proj.ubc_tutoring.domain;

public class Tutor {

    private int tutor_id;
    private String username;
    private String degree;
    private String status;
    private float gpa;
    private String bio;

    public Tutor(int tutor_id, String username, String degree, String status, float gpa, String bio) {
        this.tutor_id = tutor_id;
        this.username = username;
        this.degree = degree;
        this.status = status;
        this.gpa = gpa;
        this.bio = bio;
    }

    public int getTutor_id() {
        return tutor_id;
    }

    public String getUsername() {
        return username;
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

    public void setTutor_id(int tutor_id) {
        this.tutor_id = tutor_id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setGpa(float gpa) {
        this.gpa = gpa;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
