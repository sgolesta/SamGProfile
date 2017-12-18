package org.cs304proj.ubc_tutoring.domain;

/**
 * The domain directory will contain classes for other entities such as
 * Student, Tutor, Administrator, Appointment, etc.
 *
 * Java objects of such classes are to be invoked in the appropriate
 * repository classes in interacting with the database.
 */
public class User {

    private String username; // should use Camel case, but this is how it is in db
    private String full_name;
    private String password; // String for now...
    private String usertype; // to be changed to enum?

    public User(){}

    public User(String username, String usertype){

        this.username = username;
        this.usertype = usertype;
    }

    public User(String username, String full_name, String usertype){

        this.username = username;
        this.full_name = full_name;
        this.usertype = usertype;
    }

    /**
     * We need to put setters and getters even if we do not use them
     * explicitly; otherwise, serialization will fail.
     *
     * To auto-generate them: alt + ins
     */
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFull_name() {
        return full_name;
    }

    public void setFull_name(String full_name) {
        this.full_name = full_name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsertype() {
        return usertype;
    }

    public void setUsertype(String usertype) {
        this.usertype = usertype;
    }
}
