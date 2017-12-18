package org.cs304proj.ubc_tutoring.domain;

public class TutorAvailable {

    private String start_datetime;
    private String end_datetime;

    public TutorAvailable(String startDate, String endDate) {
        this.start_datetime = startDate;
        this.end_datetime = endDate;
    }

    public String getStart_datetime() {
        return start_datetime;
    }

    public String getEnd_datetime() {
        return end_datetime;
    }
}
