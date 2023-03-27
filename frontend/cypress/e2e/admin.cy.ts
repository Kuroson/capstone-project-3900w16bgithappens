describe("Admin Workflow", () => {
  before(() => {
    // indexedDB.deleteDatabase("firebaseLocalStorageDb"); // Reset firebase localstorage login
  });

  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  const firstName = "Cypress";
  const lastName = "Workflow";
  const dateNow = Date.now();
  const email = `${firstName}${dateNow}@${lastName}.com`.toLowerCase();
  const adminEmail = `${firstName}${dateNow}@admin.com`.toLowerCase();
  const password = "cypress1234!";

  const pageWeek1 = "Week 1";
  const pageWeek2 = "Week 2";

  const description = `OOPs\n${dateNow}`;
  const courseCode = "COMP2511";
  const title = "Art of Software";
  const session = "23T1";

  const resource1Title = "Resource 1";
  const resource1Description = "Resource 1 Description";
  const resource1FileName = "cs251123t1-SetupTroubleshooting.pdf";

  // it("Sign up for a student account", () => {
  //   indexedDB.deleteDatabase("firebaseLocalStorageDb"); // Reset firebase localstorage login
  //   cy.visit("http://localhost:3000/signup");
  //   cy.get("#first-name-input").focus().type(firstName);
  //   cy.get("#last-name-input").focus().type(lastName);
  //   cy.get("#email-input").focus().type(email);
  //   cy.get("#outlined-password-input").focus().type(password);
  //   cy.get("#outlined-confirm-password-input").focus().type(password);
  //   cy.get("#submit-form-button").click();
  //   cy.wait(2000);
  //   cy.location("pathname").should("eq", "/");
  //   cy.get("h1").contains(`Welcome, ${firstName} ${lastName}`);
  //   cy.get("#userRole").contains("Student");
  //   cy.wait(1000);
  // });

  // it("Sign up for an instructor account", () => {
  //   indexedDB.deleteDatabase("firebaseLocalStorageDb"); // Reset firebase localstorage login
  //   cy.visit("http://localhost:3000/signup");
  //   cy.get("#first-name-input").focus().type(firstName);
  //   cy.get("#last-name-input").focus().type(lastName);
  //   cy.get("#email-input").focus().type(adminEmail);
  //   cy.get("#outlined-password-input").focus().type(password);
  //   cy.get("#outlined-confirm-password-input").focus().type(password);
  //   cy.get("#submit-form-button").click();
  //   cy.wait(2000);
  //   cy.location("pathname").should("eq", "/instructor");
  //   cy.get("h1").contains(`Welcome, ${firstName} ${lastName}`);
  //   cy.get("#userRole").contains("Instructor");
  //   cy.wait(1000);
  // });

  // it("Test dashboard nav buttons after signup", () => {
  //   cy.visit("http://localhost:3000");
  //   cy.location("pathname").should("eq", "/instructor");
  //   // Click Dashboard
  //   cy.get("#navbar").contains("Dashboard").click();
  //   cy.location("pathname").should("eq", "/instructor");
  //   // Click Instructor Allocation
  //   cy.get("#navbar").contains("Instructor allocation").click();
  //   cy.location("pathname").should("eq", "/instructor/instructor-allocation");
  //   // Click Create Course
  //   cy.get("#navbar").contains("Create Course").click();
  //   cy.location("pathname").should("eq", "/instructor/create-course");
  //   // Go back to dashboard
  //   cy.get("#navbar").contains("Dashboard").click();
  //   cy.location("pathname").should("eq", "/instructor");
  // });

  it("Create a course and add details", async () => {
    cy.visit("http://localhost:3000/instructor");
    // Click create course button
    cy.get('[data-cy="createCourseDiv"]').click();
    cy.location("pathname").should("eq", "/instructor/create-course");

    // Create course
    cy.get("#CourseCode").focus().type(courseCode);
    cy.get("#Title").focus().type(title);
    cy.get("#Session").focus().type(session);
    cy.get("#Description").focus().type(description);
    cy.get("#create-course-button").click();
    cy.wait(500);
    cy.get(".Toastify__toast-body").contains("Course created successfully");

    // Check page has details
    cy.get("h1").contains(title);

    cy.location("pathname").then((location) => {
      // Verify creation on dashboard
      cy.get("#navbar").contains("Dashboard").click();
      cy.location("pathname").should("eq", "/instructor");
      cy.get(`[href="${location}"]`).click();
      cy.location("pathname").should("eq", location);

      // Add student to course
      // cy.get("#navbar").contains("Students").click();
      // cy.location("pathname").should("eq", `${location}/students`);
      // cy.get("#student-email").focus().type(email);
      // cy.get("button").contains("Add Student").click();
      // cy.get(".Toastify__toast-body").contains("Student added successfully");

      // Go back to course home page
      cy.get("#navbar").contains("Home").click();
      cy.location("pathname").should("eq", `${location}`);

      // Add new page "Week 1"
      cy.get("#addNewPage").click();
      cy.get("#RadioOtherPage").click(); // Select other page
      cy.get("#OtherPageName").focus().type(pageWeek1);
      cy.get("button").contains("Add new page").click(); // Create
      cy.get("#navbar").contains(pageWeek1);

      // Create week2
      cy.get("#addNewPage").click();
      cy.get("#RadioOtherPage").click(); // Select other page
      cy.get("#OtherPageName").focus().type(pageWeek2);
      cy.get("button").contains("Add new page").click(); // Create
      cy.get("#navbar").contains(pageWeek2);

      // Click on week1
      cy.get("#navbar").contains(pageWeek1).click();

      // Create Resource for Week 1
      cy.get("button").contains("Add New Resource").click();
      cy.get("#ResourceTitle").focus().type(resource1Title);
      cy.get("#ResourceDescription").focus().type(resource1Description);
      cy.get("#uploadResourceMaterial").selectFile(`cypress/fixtures/${resource1FileName}`);
      cy.get("#createResourceButton").click();

      // Check Resource1 Created
      cy.get("span").contains(resource1Title);
      cy.get("p").contains(resource1Description);
      // check if file download exists
      cy.get('[data-cy="section"] > div > a > button').contains("Download File");
      cy.get('[data-cy="section"] > div > a').should("have.attr", "href");
    });
  });
});

// Prevent TypeScript from reading file as legacy script
export {};
