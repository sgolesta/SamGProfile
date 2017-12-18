package org.cs304proj.ubc_tutoring.domain;

public class Room {
    private int location_id;
    private String room_name;
    private String address;

    public Room(int location_id, String room_name, String address) {
        this.location_id = location_id;
        this.room_name = room_name;
        this.address = address;
    }

    public int getLocation_id() {
        return location_id;
    }

    public void setLocation_id(int location_id) {
        this.location_id = location_id;
    }

    public String getRoom_name() {
        return room_name;
    }

    public void setRoom_name(String room_name) {
        this.room_name = room_name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
