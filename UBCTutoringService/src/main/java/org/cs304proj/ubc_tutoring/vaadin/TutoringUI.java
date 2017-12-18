package org.cs304proj.ubc_tutoring.vaadin;

import com.vaadin.annotations.Theme;
import com.vaadin.event.ShortcutAction;
import com.vaadin.server.VaadinRequest;
import com.vaadin.spring.annotation.SpringUI;
import com.vaadin.ui.*;
import com.vaadin.ui.Button.ClickEvent;
import com.vaadin.ui.themes.ValoTheme;
import org.cs304proj.ubc_tutoring.domain.*;
import org.cs304proj.ubc_tutoring.repository.*;
import org.cs304proj.ubc_tutoring.domain.Appointment;
import org.cs304proj.ubc_tutoring.domain.TutorAvailable;
import org.cs304proj.ubc_tutoring.domain.User;
import org.cs304proj.ubc_tutoring.repository.AdminDAO;
import org.cs304proj.ubc_tutoring.repository.TutorDAO;
import org.cs304proj.ubc_tutoring.repository.UserDAO;

import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Our project is based on the following tutorial in its basic architecture:
 * https://vaadin.com/blog/building-a-web-ui-for-mysql-databases-in-plain-java-
 * Since this is the main file of our application, the credit to the source is
 * acknowledged here for the project.
 *
 * This class, in particular, renders the data from the database into UI, using Vaadin.
 */
@SpringUI
@Theme(ValoTheme.THEME_NAME)
public class TutoringUI extends UI {

    /**
     * Spring Autowiring is for dependency injection (Spring classes
     * in jars manage Java class objects without explicit 'new'
     * statement). This annotation tells Spring to create an instance of
     * our repository classes, so that we can invoke methods of the classes.
     *
     * With the experience of the Vaadin-based architecture gained from the project,
     * we would refactor the code to inject through interfaces. Also, our domain classes
     * would be used to pass values to the DAO's using binder and setBeans, as in the tutorial.
     */
    @Autowired
    private UserDAO userDAO;

    @Autowired
    private TutorDAO tutorDAO;

    @Autowired
    private AdminDAO adminDAO;

    @Autowired
    private CourseDAO courseDAO;

    @Autowired
    private StudentDAO studentDAO;

    // User grids
    private Grid<User> grid = new Grid<>(User.class);
    private Grid<Course> courseGrid = new Grid<>(Course.class);
    private Grid<Building> buildingGrid = new Grid<>(Building.class);
    private Grid<Room> roomGrid = new Grid<>(Room.class);


    // Tutor Grids
    private Grid<TutorAvailable> availableGrid = new Grid<>(TutorAvailable.class);

    // Admin grids
    private Grid<Appointment> appointmentGrid = new Grid<>(Appointment.class);
    private Grid<Appointment> sessionGrid = new Grid<>(Appointment.class);


    //@Autowired
    //VaadinSecurity vaadinSecurity;

    private String current_user; // stores the user name of the logged-in

    private TextField userName;

    private PasswordField passwordField;

    private CheckBox rememberMe;

    private Button login;
    private Button logout;

    private Label loginFailedLabel;
    private Label loggedOutLabel;

    // globals for grid selection
    private String selectedStart;
    private String selectedEnd;
    private int selectedTutorID;
    private int selectedCourseNum;
    private int selectedAppointmentId;

    private String selectedSubject;
    private String selectedCourse_number;

    private String selectedAddress;
    private String selectedRoomName;
    private String selectedRoomAddr;

    private static final String ADMIN = "Admin";
    private static final String STUDENT = "Student";
    private static final String TUTOR = "Tutor";

    // Initial page load - note: refreshing at any point will take us here
    @Override
    protected void init(VaadinRequest request) {
        getPage().setTitle("Tutor App Login");

        showLoginInfo(false);

    }

    private void login(String user, String pass) {
        userDAO.authenticateUser(user,pass);

        String authUserType = userDAO.getAuthUsertype();

        if (authUserType == null) {
            showLoginInfo(true);

        } else {
            courseDAO.updateAvailableCourses();

            switch (authUserType) {

                case STUDENT:
                    showStudentInfo(0);
                    break;
                case TUTOR:
                    showtutorInfo(0);
                    break;
                case ADMIN:
                    showAdminInfo(0);
                    break;
            }
        }
    }

    private void logout() {
        showLoginInfo(false);
    }

    private void showLoginInfo(Boolean loginFail) {
        Label label = new Label("UBC Tutor App Demo");
        label.addStyleName(ValoTheme.LABEL_HUGE);

        FormLayout loginForm = new FormLayout();
        loginForm.setSizeUndefined();

        loginForm.addComponent(userName = new TextField("Username"));
        loginForm.addComponent(passwordField = new PasswordField("Password"));

        loginForm.addComponent(login = new Button("Login"));
        login.addStyleName(ValoTheme.BUTTON_PRIMARY);
        login.setDisableOnClick(true);
        login.setClickShortcut(ShortcutAction.KeyCode.ENTER);
        login.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent event) {
                login(userName.getValue(), passwordField.getValue());
            }
        });

        VerticalLayout loginLayout = new VerticalLayout();
        loginLayout.setSpacing(true);
        loginLayout.setSizeUndefined();

        loginLayout.addComponent(label);
        loginLayout.setComponentAlignment(label, Alignment.TOP_CENTER);

        loginLayout.addComponent(loginForm);
        loginLayout.setComponentAlignment(loginForm, Alignment.TOP_CENTER);

        loginLayout.addComponent(loginFailedLabel = new Label("Invalid login, try again"));
        loginLayout.setComponentAlignment(loginFailedLabel, Alignment.BOTTOM_CENTER);
        loginFailedLabel.setSizeUndefined();
        loginFailedLabel.addStyleName(ValoTheme.LABEL_FAILURE);
        loginFailedLabel.setVisible(false);

        if (loginFail) {
            loginFailedLabel.setVisible(true);
        }

        VerticalLayout rootLayout = new VerticalLayout(loginLayout);
        //rootLayout.setSizeFull();
        rootLayout.setComponentAlignment(loginLayout, Alignment.MIDDLE_CENTER);
        setContent(rootLayout);
        //setSizeFull();
    }

    private void showtutorInfo(int tabIndex){
        // First get tutor info
        tutorDAO.getTutorInfo(userDAO.getAuthUsername());

        AbsoluteLayout layout = new AbsoluteLayout();
        generateHeader(layout);

        TabSheet tabsheet = new TabSheet();
        layout.addComponent(tabsheet, "left: 10px; top: 50px");


        // Profile tab
        VerticalLayout profileTab = new VerticalLayout();
        profileTab.addComponent(new Label("Profile information below"));

        TextField degree;
        TextField status;
        TextField gpa;
        TextArea bio;
        Button saveProfile;
        profileTab.addComponent(degree = new TextField("Degree"));
        profileTab.addComponent(status = new TextField("Status"));
        profileTab.addComponent(gpa = new TextField("GPA"));
        profileTab.addComponent(bio = new TextArea("Bio"));

        degree.setValue(tutorDAO.getDegree() != null ? tutorDAO.getDegree() : "");
        degree.setWidth("250px");
        status.setValue(tutorDAO.getStatus() != null ? tutorDAO.getStatus() : "");
        status.setWidth("250px");
        gpa.setValue(String.valueOf(tutorDAO.getGpa()));
        gpa.setWidth("250px");
        bio.setValue(tutorDAO.getBio() != null ? tutorDAO.getBio() : "");
        bio.setWidth("300px");

        profileTab.addComponent(saveProfile = new Button("Save"));
        saveProfile.setDisableOnClick(true);
        saveProfile.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent event) {
                saveProfile(degree.getValue(), status.getValue(), Float.parseFloat(gpa.getValue()), bio.getValue());
            }
        });

        tabsheet.addTab(profileTab, "My Profile");


        // Availability tab
        DateTimeField startDate;
        DateTimeField endDate;
        Button addAvailability;
        Button deleteAvailability;

        HorizontalLayout availableTab = new HorizontalLayout();
        VerticalLayout availableForm = new VerticalLayout();
        availableForm.addComponent(new Label("Enter a new availability below:"));
        availableForm.addComponent(startDate = new DateTimeField("Starting"));
        availableForm.addComponent(endDate = new DateTimeField("Ending"));

        availableForm.addComponent(addAvailability = new Button("Save"));
        addAvailability.setDisableOnClick(true);
        addAvailability.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent event) {
                addAvailability(startDate.getValue(), endDate.getValue());
            }
        });

        availableForm.addComponent(new Label("Or select a deletion from the table:"));
        availableForm.addComponent(deleteAvailability = new Button("Delete selected"));
        deleteAvailability.addStyleName(ValoTheme.BUTTON_DANGER);
        deleteAvailability.setDisableOnClick(true);
        deleteAvailability.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent clickEvent) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.S");
                deleteAvailability(
                        LocalDateTime.parse(selectedStart, formatter),
                        LocalDateTime.parse(selectedEnd, formatter)
                );
            }
        });

        availableTab.addComponent(availableForm);
        availableTab.addComponent(updateTutorAvailGrid());
        tabsheet.addTab(availableTab, "Availability");

        // Courses
        NativeSelect<String> subject;
        Button subjectBtn;

        HorizontalLayout coursesTab = new HorizontalLayout();
        VerticalLayout courseForm = new VerticalLayout();
        courseForm.addComponent(subject = new NativeSelect<>("Subject"));
        subject.setItems(courseDAO.getSubjectNames());
        courseForm.addComponent(subjectBtn = new Button("Choose"));
        subjectBtn.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent event) {
                selectedSubject = subject.getValue();
                System.out.println(courseForm.getComponentCount());
                // clear previous components
                if (courseForm.getComponentCount() > 2) {
                    courseForm.removeComponent(courseForm.getComponent(2));
                    courseForm.removeComponent(courseForm.getComponent(2));
                }

                NativeSelect<Integer> courseNum;
                Button addCourse;

                courseForm.addComponent(courseNum = new NativeSelect<>("Course Number"));
                courseNum.setItems(courseDAO.getCourseNumFromSubject(selectedSubject));
                courseForm.addComponent(addCourse = new Button("Add"));
                addCourse.addClickListener(new Button.ClickListener() {
                    @Override
                    public void buttonClick(Button.ClickEvent event) {
                        selectedCourseNum = courseNum.getValue();
                        addTutorCanTeach(selectedCourseNum, selectedSubject);

                    }
                });

            }
        });

        coursesTab.addComponent(courseForm);
        coursesTab.addComponent(updateTutorCanTeachGrid());
        tabsheet.addTab(coursesTab, "My Courses");


        // View appointments
        VerticalLayout apptTab = new VerticalLayout();
        apptTab.addComponent(new Label("Here are your current pending appointments:"));
        apptTab.addComponent(updateTutorAppointmentGrid());
        tabsheet.addTab(apptTab, "Appointments");

        // View Sessions
        // TODO: (OPtional for now) Get all hours from previous sessions - TutorDAO
        VerticalLayout sessTab = new VerticalLayout();
        sessTab.addComponent(new Label("Here are your booked sessions:"));
        sessTab.addComponent(new Label("Total hours to date: "));
        sessTab.addComponent(updateTutorSessionGrid());
        tabsheet.addTab(sessTab, "Booked Sessions");

        tabsheet.setSelectedTab(tabIndex);
        setContent(layout);
    }

    private void showStudentInfo(int tabIndex){
        studentDAO.getStudentInfo(userDAO.getAuthUsername());

        AbsoluteLayout layout = new AbsoluteLayout();
        generateHeader(layout);

        TabSheet tabsheet = new TabSheet();
        layout.addComponent(tabsheet, "left: 10px; top: 50px");

        // Profile tab
        VerticalLayout profileTab = new VerticalLayout();
        profileTab.addComponent(new Label("Profile information below"));
        tabsheet.addTab(profileTab, "My Profile");

        TextField degree;
        TextField needs;
        Button saveProfile;
        profileTab.addComponent(degree = new TextField("Degree"));
        profileTab.addComponent(needs = new TextField("Needs"));


        degree.setValue(studentDAO.getDegree() != null? studentDAO.getDegree() : "");
        degree.setWidth("250px");
        needs.setValue(studentDAO.getNeeds() != null? studentDAO.getNeeds() : "");
        needs.setWidth("250px");

        profileTab.addComponent(saveProfile = new Button("Save"));
        saveProfile.setDisableOnClick(true);
        saveProfile.addClickListener(new Button.ClickListener(){
        
            @Override
            public void buttonClick(ClickEvent event) {
                saveStudentProfile(degree.getValue(), needs.getValue());
            }
        });

        // View appointments
        VerticalLayout apptTab = new VerticalLayout();
        apptTab.addComponent(new Label("Here are your current pending appointments:"));
        apptTab.addComponent(updateStudentAppointmentGrid());
        tabsheet.addTab(apptTab, "Appointments");

        // View sessions
        VerticalLayout sessTab = new VerticalLayout();
        sessTab.addComponent(new Label("These are your current booked sessions:"));
        sessTab.addComponent(updateStudentSessionGrid());
        tabsheet.addTab(sessTab, "Booked Sessions");

        // Tutor searching
        NativeSelect<String> courseName;
        Button searchTutors;

        HorizontalLayout tutorTab = new HorizontalLayout();
        VerticalLayout searchForm = new VerticalLayout();
        searchForm.addComponent(new Label("Search tutors by subject and request a session!"));
        searchForm.addComponent(courseName = new NativeSelect<String>("Select Subject"));
        courseName.setItems(courseDAO.getSubjectNames());

        searchForm.addComponent(searchTutors = new Button("Find tutors"));
        searchTutors.setDisableOnClick(false);
        searchTutors.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent event) {
                selectedSubject = courseName.getValue();
                // clear previous components
                if (searchForm.getComponentCount() > 3) {
                    searchForm.removeComponent(searchForm.getComponent(3));
                }

                if (tutorTab.getComponentCount() > 1) {
                    tutorTab.removeComponent(tutorTab.getComponent(1));
                }

                searchForm.addComponent(updateTutorsGrid(selectedSubject,tutorTab));
            }
        });
        tutorTab.addComponent(searchForm);
        tabsheet.addTab(tutorTab, "Find a tutor");

        tabsheet.setSelectedTab(tabIndex);
        setContent(layout);
    }

    private void showAdminInfo(int tabIndex){

        AbsoluteLayout layout = new AbsoluteLayout();
        generateHeader(layout);
        TabSheet tabsheet = new TabSheet();
        layout.addComponent(tabsheet, "left: 10px; top: 50px");

        // Users tab -- can add users from here?
        // TODO: Display a list of all users - UserDAO
        // Done
        // TODO: Create a new user (through form) of selected type - AdminDAO
        // Done


        // TODO: Deliverable 8: view a list of tutors grouped by major - AdminDAO

        HorizontalLayout newUserTab = new HorizontalLayout();
        VerticalLayout newUserForm = new VerticalLayout();

        TextField userName;
        TextField fullName;
        TextField password;
        NativeSelect<String> userType;
        Button addNewUser;

        newUserForm.addComponent(new Label("Add a new user"));
        newUserForm.addComponent(userName = new TextField("User Name"));
        newUserForm.addComponent(fullName = new TextField("Name"));
        newUserForm.addComponent(password = new PasswordField("Password"));
        newUserForm.addComponent(userType = new NativeSelect<>("User Type"));
        userType.setItems(ADMIN, STUDENT, TUTOR);
        userType.setEmptySelectionAllowed(false);
        userType.setValue(ADMIN);

        newUserForm.addComponent(addNewUser = new Button("Save"));
        addNewUser.setDisableOnClick(true);
        addNewUser.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent event) {

                addNewUser(userName.getValue(), fullName.getValue(),
                        password.getValue(), userType.getValue());
            }
        });

        newUserTab.addComponent(newUserForm);
        newUserTab.addComponent(upDateUsersGrid());
        tabsheet.addTab(newUserTab, "Users");

        // View pending appointments -- and book appointments
        //TODO: Deliverable 12: Create view for list of all pending appointments for all students - DB-level
        // I think it is done. All Students (TA info is also included: who is teaching?)

        //TODO: Generate table from this view - AdminDAO
        // Done

        //TODO: Deliverable 2: Create a session record from an appointment ID - AdminDAO
        // Done

        //TODO: Deliverable 3: Reject an appointment by appointment ID (delete) - AdminDAO
        //Done

        HorizontalLayout apptTab = new HorizontalLayout();
        VerticalLayout apptForm = new VerticalLayout();

        TextField appointmentId;
        Button approveAppointment;
        Button rejectAppointment;

        // For approving
        apptForm.addComponent(new Label("Enter appointment Id and approve the pending appointment."));
        apptForm.addComponent(appointmentId = new TextField("Appointment Id"));
        appointmentId.setWidth("50px");
        apptForm.addComponent(approveAppointment = new Button("Approve"));
        approveAppointment.addStyleName(ValoTheme.BUTTON_PRIMARY);
        approveAppointment.setDisableOnClick(true);
        approveAppointment.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent event) {

                approveAppointment(appointmentId.getValue(), current_user);
            }
        });

        // For rejecting
        apptForm.addComponent(new Label("Select by clicking a pane and reject the appointment."));
        apptForm.addComponent(rejectAppointment = new Button("Reject"));
        rejectAppointment.addStyleName(ValoTheme.BUTTON_DANGER);
        rejectAppointment.setDisableOnClick(true);
        rejectAppointment.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent clickEvent) {

                rejectAppointment(selectedAppointmentId);
            }
        });

        apptTab.addComponent(apptForm);
        apptTab.addComponent(updateAppointmentGrid());
        tabsheet.addTab(apptTab, "Pending Appointments");

        // See all confirmed sessions
        // TODO: View all sessions - AdminDAO
        VerticalLayout sessTab = new VerticalLayout();
        sessTab.addComponent(new Label("Confirmed appointments"));
        sessTab.addComponent(updateSessionGrid());
        tabsheet.addTab(sessTab, "All sessions");

        // Courses
        // TODO: Display all courses - AdminDAO
        // TODO: Add new course - AdminDAO
        HorizontalLayout newCourseTab = new HorizontalLayout();
        VerticalLayout newCourseForm = new VerticalLayout();

        TextField subject;
        TextField course_number;
        TextField course_name;
        Button addCourse;
        Button deleteCourse;

        newCourseForm.addComponent(new Label("Add a new course"));
        newCourseForm.addComponent(subject = new TextField("Course Subject (e.g. CPSC)"));
        newCourseForm.addComponent(course_number = new TextField("Course Number"));
        newCourseForm.addComponent(course_name = new TextField("Course Name (e.g. Intro to DB)"));

        newCourseForm.addComponent(addCourse = new Button("Save"));
        addCourse.setDisableOnClick(true);
        addCourse.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent event) {

                addNewCourse(subject.getValue(),Integer.parseInt(course_number.getValue()),
                        course_name.getValue());
            }
        });

        newCourseForm.addComponent(new Label("Or select a course from the table to delete:"));
        newCourseForm.addComponent(deleteCourse = new Button("Delete selected"));
        deleteCourse.addStyleName(ValoTheme.BUTTON_DANGER);
        deleteCourse.setDisableOnClick(true);
        deleteCourse.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent clickEvent) {

                deleteCourse(selectedSubject, selectedCourse_number);
            }
        });

        newCourseTab.addComponent(newCourseForm);
        newCourseTab.addComponent(updateCourseGrid());
        tabsheet.addTab(newCourseTab, "Courses");

        // Locations
        // TODO: Display all locations - AdminDAO
        // TODO: add new location - AdminDAO
        HorizontalLayout LocationTab = new HorizontalLayout();
        VerticalLayout newBuildingForm = new VerticalLayout();

        TextField building_name;
        TextField address;

        TextField room_name;
        TextField room_addr;
        Button addBuilding, addRoom;
        Button deleteBuilding, deleteRoom;

        newBuildingForm.addComponent(new Label("Add a new Building"));
        newBuildingForm.addComponent(building_name = new TextField("Building Name:"));
        newBuildingForm.addComponent(address = new TextField("Building Address"));

        newBuildingForm.addComponent(addBuilding = new Button("Save"));
        addBuilding.setDisableOnClick(true);
        addBuilding.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent event) {

                addNewBuilding(building_name.getValue(),address.getValue());
            }
        });

        //deletion, have constraint issue
//        newBuildingForm.addComponent(new Label("Or select a building to delete"));
//        newBuildingForm.addComponent(deleteBuilding = new Button("Delete selected"));
//        deleteBuilding.addStyleName(ValoTheme.BUTTON_DANGER);
//        deleteBuilding.setDisableOnClick(true);
//        deleteBuilding.addClickListener(new Button.ClickListener() {
//            @Override
//            public void buttonClick(Button.ClickEvent clickEvent) {
//
//                deleteBuilding(selectedAddress);
//            }
//        });

        newBuildingForm.addComponent(new Label("Add a new Room"));
        newBuildingForm.addComponent(room_name = new TextField("Room Name:"));
        newBuildingForm.addComponent(room_addr = new TextField("Room Address"));

        newBuildingForm.addComponent(addRoom = new Button("Save"));
        addRoom.setDisableOnClick(true);
        addRoom.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent event) {

                addNewRoom(room_name.getValue(),room_addr.getValue());
            }
        });

        // button for deletion, have constraint issues.
//        newBuildingForm.addComponent(new Label("Or select a room to delete"));
//        newBuildingForm.addComponent(deleteRoom = new Button("Delete selected"));
//        deleteRoom.addStyleName(ValoTheme.BUTTON_DANGER);
//        deleteRoom.setDisableOnClick(true);
//        deleteRoom.addClickListener(new Button.ClickListener() {
//            @Override
//            public void buttonClick(Button.ClickEvent clickEvent) {
//
//                deleteRoom(selectedRoomName, selectedRoomAddr);
//            }
//        });

        LocationTab.addComponent(newBuildingForm);
        LocationTab.addComponent(updateBuildingGrid());
        LocationTab.addComponent(updateRoomGrid());

        tabsheet.addTab(LocationTab, "Locations");


        // Appointment stats
        VerticalLayout courseStatTab = new VerticalLayout();
        HorizontalLayout courseStats = new HorizontalLayout();
        courseStats.addComponent(new Label("Displaying total appointment count per subject:"));
        courseStats.addComponent(updateCourseStatGrid());
        courseStatTab.addComponent(courseStats);
        tabsheet.addTab(courseStatTab, "Appointment stats");

        tabsheet.setSelectedTab(tabIndex);
        setContent(layout);
    }

    // generates header for a given absolute page layout
    private void generateHeader(AbsoluteLayout layout) {

        HorizontalLayout headerLayout = new HorizontalLayout();

        current_user = userDAO.getAuthUsername();

        Label headerLabel = new Label("Logged in as:  "+ current_user +
                "  ("+userDAO.getAuthUsertype()+")");
        headerLayout.addComponent(headerLabel);
        layout.addComponent(logout = new Button("Logout"), "right: 0px; top: 0px;");

        logout.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent event) {
                logout();
            }
        });

        layout.addComponent(headerLayout, "left: 5px; top: 0px");
    }

    /**
     * ------------ Administrator related methods ---------------
     */

    private VerticalLayout updateSessionGrid(){

        sessionGrid.setColumns("appointmentId", "adminName", "studentName", "tutorName", "subject", "courseNumber",
                "building", "room", "start", "end");
        VerticalLayout layout = new VerticalLayout(sessionGrid);
        sessionGrid.setItems(adminDAO.getAllConfirmedAppointments());
        sessionGrid.setWidth("100%");

        return layout;
    }

    private void rejectAppointment(Integer appointmentId){

        adminDAO.deleteAppointment(appointmentId);
        showAdminInfo(1);
    }

    private void approveAppointment(String appointmentId, String adminName){

        adminDAO.addSession(appointmentId, adminName);
        showAdminInfo(1);
    }

    private VerticalLayout upDateUsersGrid(){

        grid.setColumns("username", "full_name", "usertype");
        VerticalLayout layout = new VerticalLayout(grid);
        List<User> users = adminDAO.getAllUser();
        grid.setItems(users);

        return layout;
    }
    private VerticalLayout updateCourseGrid() {
        courseGrid.setColumns("subject", "course_number", "course_name");
        VerticalLayout layout = new VerticalLayout(courseGrid);
        List<Course> course = adminDAO.getAllCourse();
        courseGrid.setItems(course);

        courseGrid.setSelectionMode(Grid.SelectionMode.SINGLE);

        courseGrid.addSelectionListener(event -> {
            courseGrid.getSelectionModel().getFirstSelectedItem().ifPresent(item -> {
                selectedSubject = item.getSubject();
                selectedCourse_number = item.getCourse_name();
            });
            Object rowId = event.getFirstSelectedItem();
        });

        return layout;
    }

    private void addNewUser(String userName, String fullName,
                            String password, String userType) {

        adminDAO.addNewUser(userName, fullName, password, userType);
        showAdminInfo(0);
    }

    private void addNewCourse(String subject, int course_number, String course_name) {
        adminDAO.addNewCourse(subject, course_number, course_name);
        showAdminInfo(3);
    }

    private void deleteCourse(String subject, String course_number) {
        adminDAO.deleteCourse(subject, Integer.parseInt(course_number));
        showAdminInfo(3);
    }

    private void addNewBuilding(String building_name, String address) {
        adminDAO.addNewBuilding(building_name, address);
        showAdminInfo(4);
    }

    private void deleteBuilding(String address) {
        adminDAO.deleteBuilding(address);
        showAdminInfo(4);
    }

    private VerticalLayout updateBuildingGrid() {
        buildingGrid.setColumns("building_name", "address");
        VerticalLayout layout = new VerticalLayout();
        layout.addComponent(new Label("Buildings"));
        layout.addComponent(buildingGrid);
        List<Building> buildings = adminDAO.getAllBuilding();
        buildingGrid.setItems(buildings);

        buildingGrid.setSelectionMode(Grid.SelectionMode.SINGLE);

        buildingGrid.addSelectionListener(event -> {
            buildingGrid.getSelectionModel().getFirstSelectedItem().ifPresent(item -> {
                selectedAddress = item.getAddress();
            });
            Object rowId = event.getFirstSelectedItem();
        });

        return layout;
    }

    private void addNewRoom(String room_name, String address) {
        adminDAO.addNewRoom(room_name, address);
        showAdminInfo(4);
    }

    private void deleteRoom(String room_name, String room_addr) {
        adminDAO.deleteRoom(room_name);
        showAdminInfo(4);
    }

    private VerticalLayout updateRoomGrid() {
        roomGrid.setColumns("room_name", "address");
        VerticalLayout layout = new VerticalLayout();
        layout.addComponent(new Label("Rooms"));
        layout.addComponent(roomGrid);
        List<Room> rooms = adminDAO.getAllRoom();
        roomGrid.setItems(rooms);

        roomGrid.setSelectionMode(Grid.SelectionMode.SINGLE);

        roomGrid.addSelectionListener(event -> {
            roomGrid.getSelectionModel().getFirstSelectedItem().ifPresent(item -> {
                selectedRoomName = item.getRoom_name();
                selectedRoomAddr = item.getAddress();
            });
            Object rowId = event.getFirstSelectedItem();
        });

        return layout;
    }
  
    private VerticalLayout updateAppointmentGrid(){

        appointmentGrid.setColumns("appointmentId", "studentName", "tutorName", "subject", "courseNumber",
                "building", "room", "start", "end");
        VerticalLayout appointmentLayout = new VerticalLayout(appointmentGrid);
        List<Appointment> appointments = adminDAO.getAllPendingAppointment();
        appointmentGrid.setItems(appointments);

        // Add listener for select and delete
        appointmentGrid.addSelectionListener(event -> {
            appointmentGrid.getSelectionModel().getFirstSelectedItem().ifPresent(item -> {
                selectedAppointmentId = item.getAppointmentId();
            });
        });

        return appointmentLayout;
    }

    private VerticalLayout updateCourseStatGrid() {
        Grid<CourseStat> courseGrid = new Grid<>(CourseStat.class);
        courseGrid.setColumns("subject", "count");
        VerticalLayout layout = new VerticalLayout(courseGrid);
        List<CourseStat> courseStats = courseDAO.getCourseStats();
        courseGrid.setItems(courseStats);

        return layout;
    }

    /**
     * ------------ Tutor related methods -------------------
     */

    private VerticalLayout updateTutorAvailGrid() {
        availableGrid.setColumns("start_datetime", "end_datetime");
        VerticalLayout layout = new VerticalLayout(availableGrid);
        List<TutorAvailable> datetimes = tutorDAO.getTutorAvailability();
        availableGrid.setItems(datetimes);

        availableGrid.setSelectionMode(Grid.SelectionMode.SINGLE);

        availableGrid.addSelectionListener(event -> {
            availableGrid.getSelectionModel().getFirstSelectedItem().ifPresent(item -> {
                selectedStart = item.getStart_datetime();
                selectedEnd = item.getEnd_datetime();
            });
        });

        return layout;
    }

    private void addAvailability(LocalDateTime startDate, LocalDateTime endDate) {
        tutorDAO.addTutorAvailability(startDate,endDate);
        showtutorInfo(1);
    }

    private void deleteAvailability(LocalDateTime startDate, LocalDateTime endDate) {
        tutorDAO.deleteTutorAvailability(startDate, endDate);
        showtutorInfo(1);
    }

    private void saveProfile(String degree, String status, float gpa, String bio) {
        tutorDAO.saveTutorProfile(degree, status, gpa, bio);
        showtutorInfo(0);
    }

    private VerticalLayout updateTutorAppointmentGrid() {
        Grid<TutorAppointment> appointmentGrid = new Grid<>(TutorAppointment.class);
        appointmentGrid.setColumns("student", "building", "room", "subject", "courseNum", "startDate", "endDate");
        VerticalLayout layout = new VerticalLayout(appointmentGrid);
        List<TutorAppointment> appointments = tutorDAO.getAppointments();
        appointmentGrid.setItems(appointments);
        appointmentGrid.setWidth("100%");

        return layout;

    }

    private VerticalLayout updateTutorSessionGrid() {
        Grid<TutorAppointment> sessionGrid = new Grid<>(TutorAppointment.class);
        sessionGrid.setColumns("student", "building", "room", "subject", "courseNum", "startDate", "endDate");
        VerticalLayout layout = new VerticalLayout(sessionGrid);
        List<TutorAppointment> sessions = tutorDAO.getSessions();
        sessionGrid.setItems(sessions);
        sessionGrid.setWidth("100%");

        return layout;
    }

    private VerticalLayout updateTutorCanTeachGrid() {
        Grid<TutorCanTeach> tutorCanTeachGrid = new Grid<>(TutorCanTeach.class);
        tutorCanTeachGrid.setColumns("subject", "course_number");
        VerticalLayout layout = new VerticalLayout(tutorCanTeachGrid);
        List<TutorCanTeach> courses = tutorDAO.getCourses();
        tutorCanTeachGrid.setItems(courses);

        return layout;
    }

    private void addTutorCanTeach(int courseNum, String subject) {
        tutorDAO.addTutorCanTeach(courseNum, subject);
        showtutorInfo(2);
    }

    /**
     * ------------ Student related methods -------------------
     */

    private VerticalLayout updateTutorsGrid(String courseName, HorizontalLayout mainPage) {
        Grid<CourseTutor> tutorGrid = new Grid<>(CourseTutor.class);
        tutorGrid.setColumns("full_name", "degree", "status", "gpa", "bio", "id");
        VerticalLayout layout = new VerticalLayout(tutorGrid);
        List<CourseTutor> tutors = tutorDAO.getTutorsByCourse(courseName);
        tutorGrid.setItems(tutors);

        tutorGrid.setSelectionMode(Grid.SelectionMode.SINGLE);

        tutorGrid.addSelectionListener(event -> {
            tutorGrid.getSelectionModel().getFirstSelectedItem().ifPresent(item -> {
                selectedTutorID = item.getId();
                if (mainPage.getComponentCount() > 1) {
                    mainPage.removeComponent(mainPage.getComponent(1));
                }
                mainPage.addComponent(updateAppointmentTutorSelection(selectedTutorID));
            });
        });

        return layout;
    }

    private void saveStudentProfile(String degree, String needs) {
        studentDAO.saveStudentProfile(degree, needs);
        showStudentInfo(0);
    }

    private VerticalLayout updateAppointmentTutorSelection(int tutorId) {
        NativeSelect<Integer> courseNum;
        NativeSelect<Integer> locationSelect;
        Button bookAppt;

        VerticalLayout apptForm = new VerticalLayout();
        apptForm.addComponent(new Label("Choose an available course number and timeslot"));
        apptForm.addComponent(courseNum = new NativeSelect<>("Select course number"));
        courseNum.setItems(courseDAO.getSpecificTutorCourseNumber(tutorId, selectedSubject));
        courseNum.setEmptySelectionAllowed(false);

        // Using ID's for location due to lack of time
        apptForm.addComponent(locationSelect = new NativeSelect<>("Select location"));
        locationSelect.setItems(studentDAO.getLocationId());
        locationSelect.setEmptySelectionAllowed(false);

        apptForm.addComponent(bookAppt = new Button("Book appointment"));
        bookAppt.setDisableOnClick(true);
        bookAppt.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent event) {
                bookAppointment(selectedTutorID, selectedSubject, courseNum.getValue(), locationSelect.getValue(),selectedStart, selectedEnd);
            }
        });

        Grid<TutorAvailable> timeSlotGrid = new Grid<>(TutorAvailable.class);
        timeSlotGrid.setColumns("start_datetime", "end_datetime");
        VerticalLayout layout = new VerticalLayout(timeSlotGrid);
        List<TutorAvailable> datetimes = tutorDAO.getTutorAvailability(tutorId);
        timeSlotGrid.setItems(datetimes);

        timeSlotGrid.setSelectionMode(Grid.SelectionMode.SINGLE);

        timeSlotGrid.addSelectionListener(event -> {
            timeSlotGrid.getSelectionModel().getFirstSelectedItem().ifPresent(item -> {
                selectedStart = item.getStart_datetime();
                selectedEnd = item.getEnd_datetime();
            });
        });
        apptForm.addComponent(layout);

        return apptForm;
    }

    private void bookAppointment(int tutorId, String subject, int courseNum, int locationId, String startTime, String endTime) {
        studentDAO.bookStudentAppointment(tutorId, subject, courseNum, locationId, startTime, endTime);
        showStudentInfo(1);
    }

    private VerticalLayout updateStudentAppointmentGrid() {
        Grid<StudentAppointment> appointmentGrid = new Grid<>(StudentAppointment.class);
        appointmentGrid.setColumns("tutor", "building", "room", "subject", "courseNum", "startDate", "endDate");
        VerticalLayout layout = new VerticalLayout(appointmentGrid);
        List<StudentAppointment> appointments = studentDAO.getAppointments();
        appointmentGrid.setItems(appointments);
        appointmentGrid.setWidth("100%");

        return layout;

    }


    private VerticalLayout updateStudentSessionGrid() {
        Grid<StudentAppointment> sessionGrid = new Grid<>(StudentAppointment.class);
        sessionGrid.setColumns("tutor", "building", "room", "subject", "courseNum", "startDate", "endDate");
        VerticalLayout layout = new VerticalLayout(sessionGrid);
        List<StudentAppointment> sessions = studentDAO.getSessions();
        sessionGrid.setItems(sessions);
        sessionGrid.setWidth("100%");

        return layout;
    }

}
