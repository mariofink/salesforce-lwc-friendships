import { LightningElement, api } from "lwc";

export default class BoatTile extends LightningElement {
  @api boat;
  selectedBoatId;

  // Getter for dynamically setting the background image for the picture
  get backgroundStyle() {
    return `background-image: url(${this.boat.Picture__c});`;
  }

  // Getter for dynamically setting the tile class based on whether the
  // current boat is selected
  get tileClass() {
    return this.selectedBoatId === this.boat.Id ? "selected" : "";
  }

  // Fires event with the Id of the boat that has been selected.
  selectBoat() {}
}
