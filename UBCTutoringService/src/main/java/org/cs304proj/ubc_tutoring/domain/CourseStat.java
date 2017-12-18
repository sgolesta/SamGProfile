package org.cs304proj.ubc_tutoring.domain;

public class CourseStat {

    private String subject;
    private int count;

    public CourseStat(String subject, int count) {
        this.subject = subject;
        this.count = count;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }
}
