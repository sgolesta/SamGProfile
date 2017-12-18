package org.cs304proj.ubc_tutoring.domain;

public class TutorCanTeach {

//    private int tutor_id;
//    private int course_number;
//    private String subject;
//
//    public TutorCanTeach(int tutor_id, int course_number, String subject) {
//        this.tutor_id = tutor_id;
//        this.course_number = course_number;
//        this.subject = subject;
//    }
//
//    public int getTutor_id() {
//        return tutor_id;
//    }
//
//    public void setTutor_id(int tutor_id) {
//        this.tutor_id = tutor_id;
//    }
//
//    public int getCourse_number() {
//        return course_number;
//    }
//
//    public void setCourse_number(int course_number) {
//        this.course_number = course_number;
//    }
//
//    public String getSubject() {
//        return subject;
//    }
//
//    public void setSubject(String subject) {
//        this.subject = subject;
//
    private String full_name;
    private String degree;
    private String status;
    private float gpa;
    private String bio;
    private int id;

    private int tutor_id;
    private int course_number;
    private String subject;

    public TutorCanTeach(int tutor_id, int course_number, String subject) {
        this.tutor_id = tutor_id;
        this.course_number = course_number;
        this.subject = subject;
    }

    public int getTutor_id() {
        return tutor_id;
    }

    public void setTutor_id(int tutor_id) {
        this.tutor_id = tutor_id;
    }

    public int getCourse_number() {
        return course_number;
    }

    public void setCourse_number(int course_number) {
        this.course_number = course_number;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }
}
