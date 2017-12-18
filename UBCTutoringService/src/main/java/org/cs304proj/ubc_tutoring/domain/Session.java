package org.cs304proj.ubc_tutoring.domain;

public class Session {
    private int admin_id;
    private int appointment_id;

    public Session(int admin_id, int appointment_id) {
        this.admin_id = admin_id;
        this.appointment_id = appointment_id;
    }

    public int getAdmin_id() {
        return admin_id;
    }

    public void setAdmin_id(int admin_id) {
        this.admin_id = admin_id;
    }

    public int getAppointment_id() {
        return appointment_id;
    }

    public void setAppointment_id(int appointment_id) {
        this.appointment_id = appointment_id;
    }
}
