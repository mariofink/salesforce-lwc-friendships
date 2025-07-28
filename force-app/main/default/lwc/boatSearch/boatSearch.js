import { LightningElement, wire, track } from "lwc";
import { subscribe, MessageContext } from "lightning/messageService";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import BOAT_SELECTED_CHANNEL from "@salesforce/messageChannel/BoatSelected__c";
import BOATS_UPDATED_CHANNEL from "@salesforce/messageChannel/BoatsUpdated__c";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import updateBoatList from "@salesforce/apex/BoatDataService.updateBoatList";
import { getRecord } from "lightning/uiRecordApi";
import BOAT_NAME_FIELD from "@salesforce/schema/Boat__c.Name";
import BOAT_GEOLOCATION_FIELD from "@salesforce/schema/Boat__c.Geolocation__c";
import BOAT_LENGTH_FIELD from "@salesforce/schema/Boat__c.Length__c";

const BOAT_FIELDS = [
  BOAT_NAME_FIELD,
  BOAT_LENGTH_FIELD
  // BOAT_GEOLOCATION_FIELD // When adding this field this will result in an exception from the getRecord call: adapter-unfullfilled-error
];

export default class BoatSearch extends LightningElement {
  isLoading = false;
  boatTypeId = "";
  @track selectedBoatId = "";
  selectedBoat = null;
  boats = [];
  subscription = null;
  boatsUpdatedSubscription = null;

  @wire(MessageContext)
  messageContext;

  connectedCallback() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        BOAT_SELECTED_CHANNEL,
        (message) => this.handleBoatSelected(message)
      );
    }
    if (!this.boatsUpdatedSubscription) {
      this.boatsUpdatedSubscription = subscribe(
        this.messageContext,
        BOATS_UPDATED_CHANNEL,
        (message) => this.handleBoatsUpdated(message)
      );
    }
  }

  handleBoatsUpdated(message) {
    console.log("BoatSearch: handleBoatsUpdated", message);
    this.updateBoats(message.boatsToUpdate);
  }

  handleBoatSelected(message) {
    console.log(
      "BoatSearch: handleBoatSelected",
      message,
      JSON.parse(JSON.stringify(BOAT_FIELDS))
    );
    this.selectedBoatId = message.recordId;
  }

  // Handles loading event
  handleLoading() {
    this.isLoading = true;
  }

  // Handles done loading event
  handleDoneLoading() {
    this.isLoading = false;
  }

  // Handles search boat event
  // This custom event comes from the form
  searchBoats(event) {
    this.handleLoading();
    this.boatTypeId = event.detail.boatTypeId;
  }

  @wire(getBoats, { boatTypeId: "$boatTypeId" })
  wiredBoats({ error, data }) {
    console.log("⛵️ BoatSearch: wiredBoats", { error, data });
    if (data) {
      this.boats = data;
    } else if (error) {
      this.boats = [];
    }
    this.handleDoneLoading();
  }

  @wire(getRecord, { recordId: "$selectedBoatId", fields: BOAT_FIELDS })
  wiredRecord({ error, data }) {
    console.log("⛵️ BoatSearch: wiredSelectedBoatRecord", {
      error,
      data,
      selectedBoatId: this.selectedBoatId
    });

    if (data) {
      console.log("⛵️ BoatSearch: Geolocation retrieved", data);
      this.selectedBoat = data.fields;
    } else if (error) {
      console.error("⛵️ BoatSearch: Error retrieving boat record", error);
    }
  }

  createNewBoat() {}

  // Method to update boat list
  async updateBoats(boatsToUpdate) {
    console.log("⛵️ BoatSearch: updateBoats", boatsToUpdate);
    try {
      this.handleLoading();

      // Call the Apex method
      const result = await updateBoatList({ data: boatsToUpdate });

      // Show success message
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Success",
          message: result,
          variant: "success"
        })
      );

      // Optionally refresh the boat list after update
      // You might want to refresh the wired data or dispatch an event
    } catch (error) {
      // Handle errors
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error updating boats",
          message: error.body?.message || error.message,
          variant: "error"
        })
      );
    } finally {
      this.handleDoneLoading();
    }
  }
}
