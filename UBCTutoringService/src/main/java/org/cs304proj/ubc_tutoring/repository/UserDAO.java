package org.cs304proj.ubc_tutoring.repository;

import org.cs304proj.ubc_tutoring.domain.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * For now, directly autowired to the UI class, but probably
 * should better be injected through an interface. The same remark holds
 * for all other repository classes.
 *
 * 'Component' annotation tells Spring to register this class as a
 * 'bean' (instance of a Spring managed application class) to be injected.
 *  We need to put it to other repo classes as well.
 *
 *  This repository class is for application functionalities for all types of
 *  users, namely Administrator, Student, and Tutor.
 */
@Component
public class UserDAO {

    /**
     * Spring Autowiring is for dependency injection.
     * This annotation tells Spring to create an instance of Spring's
     * JdbcTemplate class, so that we can invoke methods of the class.
     */
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String authUsername;
    private String authUsertype;

    public void authenticateUser(String user, String pass) {
        List<User> authUser = jdbcTemplate.query(
                "SELECT username, usertype FROM user WHERE username = ? and password = ?",
                new String[]{user,pass},
                (rs, rowNum) -> new User(rs.getString("username"),
                                         rs.getString("usertype")));

        if (authUser.size() != 0) {
            User authenticated = authUser.get(0);
            this.authUsername = authenticated.getUsername();
            this.authUsertype = authenticated.getUsertype();
        } else {
            this.authUsername = null;
            this.authUsertype = null;
        }
    }

    public String getAuthUsertype() {
        return this.authUsertype;
    }

    public String getAuthUsername() {
        return this.authUsername;
    }

}
