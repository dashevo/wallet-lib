class DAPIClient {
  constructor() {
    this.type = this.constructor.name;
  }

  async getAddressSummary() {
    throw new Error(`Missing implementation - ${this.type}`);
  }

  async getStatus() {
    throw new Error(`Missing implementation - ${this.type}`);
  }

  async getTransaction() {
    throw new Error(`Missing implementation - ${this.type}`);
  }

  async getUTXO() {
    throw new Error(`Missing implementation - ${this.type}`);
  }

  async subscribeToAddresses() {
    throw new Error(`Missing implementation - ${this.type}`);
  }

  async sendRawTransaction() {
    throw new Error(`Missing implementation - ${this.type}`);
  }

  async updateNetwork() {
    throw new Error(`Missing implementation - ${this.type}`);
  }

  async closeSocket() {
    throw new Error(`Missing implementation - ${this.type}`);
  }
}
module.exports = DAPIClient;
