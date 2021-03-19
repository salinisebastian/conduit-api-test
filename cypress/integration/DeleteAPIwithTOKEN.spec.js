/// <reference types="cypress"/>

describe("Test with backend", () => {
  beforeEach("login to the app", () => {
    //  cy.intercept({ method: "GET", path: "tags" }, { fixture: "tags.json" });
    cy.LoginToApplication();
    // cy.visit("/login");
  });

  //   it("login", () => {
  //    // cy.intercept("POST", "**/users/login").as("login");

  //     // cy.get('[placeholder="Email"]').type("testinsta23@gmail.com");
  //     // cy.get('[placeholder="Password"]').type("hellotest");
  //     // cy.get("form").submit();
  //     // cy.wait("@login");

  //     // cy.get("@login").then((xhr) => {
  //     //   console.log(xhr);
  //     //   const token = xhr.response.body.user.token;
  //     //   console.log(token);
  //     // });

  //   });
  // });
  it("login", () => {
    const bodyRequest = {
      article: {
        tagList: [],
        title: "Hello from postman",
        description: "this is description",
        body: "this is body",
      },
    };
    cy.get("@token").then((token) => {
      cy.request({
        url: "https://conduit.productionready.io/api/articles/",
        headers: { Authorization: "Token " + token },
        method: "POST",
        body: bodyRequest,
      }).then((response) => {
        expect(response.status).to.equal(200);
      });
      cy.contains("Global Feed").click();
      cy.get(".article-preview").first().click();
      cy.get(".article-actions").contains("Delete Article").click();
      cy.request({
        url:
          "https://conduit.productionready.io/api/articles?limit=10&offset=0",
        headers: { Authorization: "Token " + token },
        method: "GET",
      })
        .its("body")
        .then((body) => {
          expect(body.articles[0].title).not.to.equal("Hello from postman");
        });
    });
  });
});
