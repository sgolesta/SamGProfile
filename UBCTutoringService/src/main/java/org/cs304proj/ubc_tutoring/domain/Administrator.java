package org.cs304proj.ubc_tutoring.domain;

public class Administrator {
    private String userName;
    private Integer adminId;

    public Administrator() {}

    public Administrator(Integer adminId) {

        this.adminId = adminId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Integer getAdminId() {
        return adminId;
    }

    public void setAdminId(Integer adminId) {
        this.adminId = adminId;
    }
}
