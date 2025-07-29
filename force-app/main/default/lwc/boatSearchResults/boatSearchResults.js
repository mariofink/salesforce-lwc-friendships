import { LightningElement, api, wire } from "lwc";
import { MessageContext, publish } from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import updateBoatList from "@salesforce/apex/BoatDataService.updateBoatList";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const SUCCESS_TITLE = "Success";
const MESSAGE_SHIP_IT = "Ship it!";
const SUCCESS_VARIANT = "success";
const ERROR_TITLE = "Error";
const ERROR_VARIANT = "error";

export default class BoatSearchResults extends LightningElement {
  boats = [];
  columns = [
    { label: "Name", fieldName: "Name", type: "text", editable: true },
    { label: "Length", fieldName: "Length__c", type: "number", editable: true },
    { label: "Price", fieldName: "Price__c", type: "currency", editable: true },
    {
      label: "Description",
      fieldName: "Description__c",
      type: "text",
      editable: true
    }
  ];
  selectedBoatId;
  @wire(MessageContext)
  messageContext;
  rowOffset = 0;
  boatTypeId = "";

  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }

  sendMessageService(boatId) {
    const payload = { recordId: boatId };
    publish(this.messageContext, BOATMC, payload);
  }

  @api
  searchBoats(boatTypeId) {
    console.log("⛵️ BoatSearchResults: searchBoats", boatTypeId);
    this.notifyLoading(true);
    this.boatTypeId = boatTypeId;
  }

  @wire(getBoats, { boatTypeId: "$boatTypeId" })
  wiredBoats({ data, error }) {
    console.log("⛵️ BoatSearchResults: wiredBoats", data, error);
    this.notifyLoading(false);
    if (data) this.boats = data;
  }

  async refresh() {
    refreshApex(this.boats);
    this.notifyLoading(true);
  }

  handleSave(event) {
    this.notifyLoading(true);
    // notify loading
    const updatedFields = event.detail.draftValues;
    // Update the records via Apex
    updateBoatList({ data: updatedFields })
      .then(() => {
        const evt = new ShowToastEvent({
          title: SUCCESS_TITLE,
          message: MESSAGE_SHIP_IT,
          variant: SUCCESS_VARIANT
        });
        this.dispatchEvent(evt);
        this.refresh();
      })
      .catch((error) => {
        const evt = new ShowToastEvent({
          title: ERROR_TITLE,
          message: error,
          variant: ERROR_VARIANT
        });
        this.dispatchEvent(evt);
        this.notifyLoading(false);
      })
      .finally(() => {
        this.draftValues = [];
      });
  }

  notifyLoading(isLoading) {
    console.log("⏳ BoatSearchResults: notifyLoading", isLoading);
    if (isLoading) {
      this.dispatchEvent(new CustomEvent("loading"));
    } else {
      this.dispatchEvent(new CustomEvent("doneloading"));
    }
  }
}
