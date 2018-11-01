class WalletLibError extends Error {
  constructor(...params) {
    super(...params);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}


class UnknownDAP extends WalletLibError {}
class UnknownPlugin extends WalletLibError {}
class InjectionToPluginUnallowed extends WalletLibError {}
class InjectionErrorCannotInject extends WalletLibError {}
class InjectionErrorCannotInjectUnknownDependency extends WalletLibError {}
class ValidTransportLayerRequired extends WalletLibError {
  constructor(method, transportInfo = {}) {
    console.error('------- Transport -----');
    console.error('Triggered by ', method);
    console.error('Transport status:', transportInfo);
    super();
  }
}

module.exports = {
  WalletLibError,
  UnknownPlugin,
  InjectionToPluginUnallowed,
  UnknownDAP,
  InjectionErrorCannotInject,
  InjectionErrorCannotInjectUnknownDependency,
  ValidTransportLayerRequired,
};
