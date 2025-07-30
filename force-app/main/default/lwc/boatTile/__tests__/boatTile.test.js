import { createElement } from "@lwc/engine-dom";
import BoatTile from "c/boatTile";

// Mock boat data for testing
const mockBoat = {
  Id: "a03xx000000001",
  Name: "Test Boat",
  Picture__c: "https://example.com/boat-image.jpg",
  Price__c: 25000,
  Length__c: 32,
  Contact__r: {
    Name: "John Doe"
  },
  BoatType__r: {
    Name: "Sailboat"
  }
};

describe("c-boat-tile", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should render boat information correctly", () => {
    // Arrange
    const element = createElement("c-boat-tile", {
      is: BoatTile
    });
    element.boat = mockBoat;

    // Act
    document.body.appendChild(element);

    // Assert
    return Promise.resolve().then(() => {
      // Check if boat name is displayed
      const boatName = element.shadowRoot.querySelector("h1");
      expect(boatName.textContent).toBe(mockBoat.Name);

      // Check if contact name is displayed
      const contactName = element.shadowRoot.querySelector("h2");
      expect(contactName.textContent).toBe(mockBoat.Contact__r.Name);

      // Check if boat type is displayed
      const boatTypeElements = element.shadowRoot.querySelectorAll(
        ".slds-text-body_small"
      );
      const boatType = Array.from(boatTypeElements).find(
        (el) => el.textContent === mockBoat.BoatType__r.Name
      );
      expect(boatType).toBeTruthy();
      expect(boatType.textContent).toBe(mockBoat.BoatType__r.Name);

      // Check if length is displayed
      const lengthElement = Array.from(boatTypeElements).find(
        (el) => el.textContent === mockBoat.Length__c.toString()
      );
      expect(lengthElement).toBeTruthy();
      expect(lengthElement.textContent).toBe(mockBoat.Length__c.toString());
    });
  });

  it("should apply correct CSS class when boat is not selected", () => {
    // Arrange
    const element = createElement("c-boat-tile", {
      is: BoatTile
    });
    element.boat = mockBoat;
    element.selectedBoatId = "differentBoatId";

    // Act
    document.body.appendChild(element);

    // Assert
    return Promise.resolve().then(() => {
      const tileWrapper = element.shadowRoot.querySelector(".tile-wrapper");
      expect(tileWrapper.classList.contains("selected")).toBe(false);
      expect(tileWrapper.className).toBe("tile-wrapper");
    });
  });

  it("should apply selected CSS class when boat is selected", () => {
    // Arrange
    const element = createElement("c-boat-tile", {
      is: BoatTile
    });
    element.boat = mockBoat;
    element.selectedBoatId = mockBoat.Id;

    // Act
    document.body.appendChild(element);

    // Assert
    return Promise.resolve().then(() => {
      const tileWrapper = element.shadowRoot.querySelector(".tile-wrapper");
      expect(tileWrapper.classList.contains("selected")).toBe(true);
      expect(tileWrapper.className).toBe("tile-wrapper selected");
    });
  });

  it("should set background image style correctly", () => {
    // Arrange
    const element = createElement("c-boat-tile", {
      is: BoatTile
    });
    element.boat = mockBoat;

    // Act
    document.body.appendChild(element);

    // Assert
    return Promise.resolve().then(() => {
      const tileImage = element.shadowRoot.querySelector(".tile");
      const expectedStyle = `background-image: url(${mockBoat.Picture__c});`;
      expect(tileImage.style.cssText).toContain("background-image");
      expect(tileImage.getAttribute("style")).toBe(expectedStyle);
    });
  });

  it("should dispatch boatselect event with correct boat ID when clicked", () => {
    // Arrange
    const element = createElement("c-boat-tile", {
      is: BoatTile
    });
    element.boat = mockBoat;

    // Create event listener mock
    const handler = jest.fn();
    element.addEventListener("boatselect", handler);

    // Act
    document.body.appendChild(element);

    return Promise.resolve().then(() => {
      // Simulate click on the tile
      const tileWrapper = element.shadowRoot.querySelector(".tile-wrapper");
      tileWrapper.click();

      // Assert
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: {
            boatId: mockBoat.Id
          }
        })
      );
    });
  });

  it("should render lightning-formatted-number for price", () => {
    // Arrange
    const element = createElement("c-boat-tile", {
      is: BoatTile
    });
    element.boat = mockBoat;

    // Act
    document.body.appendChild(element);

    // Assert
    return Promise.resolve().then(() => {
      const priceElement = element.shadowRoot.querySelector(
        "lightning-formatted-number"
      );
      expect(priceElement).toBeTruthy();
      expect(priceElement.value).toBe(mockBoat.Price__c);
      expect(priceElement.maximumFractionDigits).toBe("2");
    });
  });

  it("should update tile class when selectedBoatId changes", () => {
    // Arrange
    const element = createElement("c-boat-tile", {
      is: BoatTile
    });
    element.boat = mockBoat;
    element.selectedBoatId = "differentId";

    // Act
    document.body.appendChild(element);

    return Promise.resolve()
      .then(() => {
        // Initial state - not selected
        let tileWrapper = element.shadowRoot.querySelector(".tile-wrapper");
        expect(tileWrapper.classList.contains("selected")).toBe(false);

        // Change selectedBoatId to match current boat
        element.selectedBoatId = mockBoat.Id;

        return Promise.resolve();
      })
      .then(() => {
        // After change - should be selected
        const tileWrapper = element.shadowRoot.querySelector(".tile-wrapper");
        expect(tileWrapper.classList.contains("selected")).toBe(true);
      });
  });
});
