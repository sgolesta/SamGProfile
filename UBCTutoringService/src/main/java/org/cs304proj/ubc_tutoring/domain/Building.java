package org.cs304proj.ubc_tutoring.domain;

public class Building {
    private String address;
    private String building_name;

    public Building(String address, String building_name) {
        this.address = address;
        this.building_name = building_name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getBuilding_name() {
        return building_name;
    }

    public void setBuilding_name(String building_name) {
        this.building_name = building_name;
    }
}
