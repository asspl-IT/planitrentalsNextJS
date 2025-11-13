import axios from "axios";
import { cartStore } from "../zustand/cartStore";

class OrderService {
  constructor() {
    this.processOrderResults = [];
    this.isIssue = false;
    this.showProgress = false;
    this.isEmailSent = false;
  }

  /**
   * ✅ Resolve API endpoint in Next.js
   * Always uses NEXT_PUBLIC variables because this service runs client-side.
   */
  getApiUrl(endpoint: string) {
  return `/aws/${endpoint}`;   // ✅ Always use rewrite
}

  /**
   * ✅ Centralized POST wrapper with error handling
   */
  async postRequest(endpoint: string, data: any) {
    try {
      const apiUrl = this.getApiUrl(endpoint);
      const response = await axios.post(apiUrl, data);

      this.processOrderResults.push(response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error in ${endpoint}:`, error);
      this.isIssue = true;

      return { isSuccess: false, data: { isSuccess: false } };
    }
  }

  /**
   * ✅ STEP 1
   * Verify if items are available before charging payment
   */
  async processShoppingCartVerifyAvailability(shoppingCart: any) {
    this.isEmailSent = false;
    this.showProgress = true;

    const result = await this.postRequest("verifyitemavailability", shoppingCart);

    if (result?.data?.isSuccess) {
      return await this.processShoppingCartRunPayment(shoppingCart);
    } else {
      return {
        success: false,
        message: result?.data?.message || "Item availability verification failed.",
      };
    }
  }

  /**
   * ✅ STEP 2 — Run the Customer Payment
   */
  async processShoppingCartRunPayment(shoppingCart: any) {
    const result = await this.postRequest("runpayment", shoppingCart);

    if (result?.data?.isSuccess) {
      return await this.processShoppingCartCreateAccount(
        shoppingCart,
        result.data.paymentSummary.resultMap
      );
    }

    return { success: false, message: result?.data?.message };
  }

  /**
   * ✅ STEP 3 — Create the Account (Salesforce)
   */
  async processShoppingCartCreateAccount(shoppingCart: any, resultMap: any) {
    const result = await this.postRequest("createaccount", shoppingCart);

    if (result?.data?.isSuccess) {
      return await this.processShoppingCartStorePayment(
        shoppingCart,
        result.data.recordId,
        resultMap
      );
    }

    return { success: false, message: result?.data?.message };
  }

  /**
   * ✅ STEP 4 — Store Payment
   */
  async processShoppingCartStorePayment(
    shoppingCart: any,
    accountId: string,
    resultMap: any
  ) {
    const payload = { shoppingCart, incomingResultMap: resultMap, accountId };
    const result = await this.postRequest("createstoredpayment", payload);

    if (result?.data?.isSuccess) {
      return await this.processShoppingCartCreateOrder(
        accountId,
        shoppingCart,
        resultMap
      );
    }

    return { success: false, message: result?.data?.message };
  }

  /**
   * ✅ STEP 5 — Create Order & Save orderName in Zustand
   */
  async processShoppingCartCreateOrder(
    accountId: string,
    shoppingCart: any,
    resultMap: any
  ) {
    const payload = { ...shoppingCart, accountId };
    const result = await this.postRequest("createorder", payload);

    if (result?.data?.isSuccess) {
      const orderId = result.data.recordId;
      const orderName = result.data.recordName;

      // ✅ Save orderName in global store
      cartStore.getState().setOrderName(orderName);

      return await this.processShoppingCartCreateItems(
        shoppingCart,
        orderId,
        accountId,
        resultMap
      );
    }

    return { success: false, message: result?.data?.message };
  }

  /**
   * ✅ STEP 6 — Create Order Items
   */
  async processShoppingCartCreateItems(
    shoppingCart: any,
    orderId: string,
    accountId: string,
    resultMap: any
  ) {
    const payload = { ...shoppingCart, orderId };
    const result = await this.postRequest("createitems", payload);

    if (result?.data?.isSuccess) {
      return await this.processShoppingCartCreateOrderPayment(
        shoppingCart,
        accountId,
        orderId,
        resultMap
      );
    }

    return { success: false, message: result?.data?.message };
  }

  /**
   * ✅ STEP 7 — Create Order Payment
   */
  async processShoppingCartCreateOrderPayment(
    shoppingCart: any,
    accountId: string,
    orderId: string,
    resultMap: any
  ) {
    const payload = {
      ...shoppingCart,
      incomingResultMap: resultMap,
      accountId,
      orderId,
    };

    const result = await this.postRequest("createorderpayment", payload);

    if (result?.data?.isSuccess) {
      return await this.processShoppingCartSendWelcomeEmail(
        result.data.recordId,
        orderId
      );
    }

    return { success: false, message: result?.data?.message };
  }

  /**
   * ✅ STEP 8 — Send Confirmation Email
   */
  async processShoppingCartSendWelcomeEmail(paymentId: string, orderId: string) {
    const payload = { paymentId, orderId };
    const result = await this.postRequest("sendwelcomeemail", payload);

    if (result?.data?.isSuccess) {
      this.isEmailSent = true;
      return { success: true, message: "Your Order Number" };
    }

    return { success: false, message: result?.data?.message };
  }
}

export default new OrderService();
