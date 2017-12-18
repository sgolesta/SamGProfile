package org.cs304proj.ubc_tutoring.domain;

public class Course {
    private String subject;
    private int course_number;
    private String course_name;

    public Course(String subject, int course_number, String course_name) {
        this.subject = subject;
        this.course_number = course_number;
        this.course_name = course_name;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public int getCourse_number() {
        return course_number;
    }

    public void setCourse_number(int course_number) {
        this.course_number = course_number;
    }

    public String getCourse_name() {
        return course_name;
    }

    public void setCourse_name(String course_name) {
        this.course_name = course_name;
    }
}
