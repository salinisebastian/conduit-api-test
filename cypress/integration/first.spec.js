/// <reference types="cypress"/>

describe("Test with backend", () => {
  beforeEach("login to the app", () => {
    cy.intercept({ method: "GET", path: "tags" }, { fixture: "tags.json" });
    cy.LoginToApplication();
  });
  it("verify correct request and response", () => {
    cy.intercept("POST", "**/articles").as("postArticles");

    cy.contains(" New Article ").click();
    cy.get('[placeholder="Article Title"]').type("Article Title");
    cy.get('[formcontrolname="description"]').type("Nothing");
    cy.get('[placeholder="Write your article (in markdown)"]').type(
      "Something"
    );
    cy.contains(" Publish Article ").click();
    cy.wait("@postArticles");
    //console.log(@postArticles)
    cy.get("@postArticles").then((xhr) => {
      console.log(xhr);
      // console.log(xhr.response.statusCode);
      expect(xhr.response.statusCode).to.equal(200);
      expect(xhr.request.body.article.body).to.equal("Something");
      expect(xhr.response.body.article.description).to.equal("Nothing");
    });
  });
  it("should gave tags with routing object", () => {
    console.log("hello", cy.get(".tag-list"));
    cy.get(".tag-list")
      .should("contain", "cypress")
      .and("contain", "automation")
      .and("contain", "testing");
  });

  it("verify global feed likes count", () => {
    cy.intercept("GET", "**/articles*", { fixture: "articles.json" });

    cy.intercept(
      "GET",
      "**/articles/feed*",
      '{"articles":[],"articlesCount":0}'
    );
    cy.contains(" Global Feed ").click();
    cy.get("app-article-list button").then((listOfButtons) => {
      expect(listOfButtons[0]).to.contain("8");
    });

    cy.fixture("articles").then((file) => {
      const articleLink = file.articles[0].slug;
      cy.intercept("POST", "**/articles/" + articleLink + "/favorite", {
        fixture: "article0.json",
      }).as("postArticlesfavorite");
    });
    // the response is actually collected from the backend here not from the article0.json file.
    cy.get("app-article-list button").eq(0).click().should("contain", "9");
    cy.wait("@postArticlesfavorite");

    cy.get("@postArticlesfavorite").then((xhr) => {
      console.log(xhr);
      //the response is actually collected from the article0.json file
      expect(xhr.response.body.article.favoritesCount).to.equal(99);
      expect(xhr.response.statusCode).to.equal(200);
    });
  });
  it("verify correct request and response", () => {
    // cy.intercept("POST", "**/articles", (req) => {
    //   req.body.article.description = "Nothing2";
    // }).as("postArticles");

    //Verifing the actual response and the mocked response
    cy.intercept("POST", "**/articles", (req) => {
      req.reply((res) => {
        expect(res.body.article.description).to.equal("Nothing");
        res.body.article.description = "Nothing2";
      });
    }).as("postArticles");

    cy.contains(" New Article ").click();
    cy.get('[placeholder="Article Title"]').type("Article Title");
    cy.get('[formcontrolname="description"]').type("Nothing");
    cy.get('[placeholder="Write your article (in markdown)"]').type(
      "Something"
    );
    cy.contains(" Publish Article ").click();
    cy.wait("@postArticles");
    //console.log(@postArticles)
    cy.get("@postArticles").then((xhr) => {
      console.log(xhr);
      // console.log(xhr.response.statusCode);
      expect(xhr.response.statusCode).to.equal(200);
      expect(xhr.request.body.article.body).to.equal("Something");
      expect(xhr.response.body.article.description).to.equal("Nothing2");
    });
  });
});
