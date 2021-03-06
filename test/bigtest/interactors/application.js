import {
  isPresent,
  interactor,
} from '@bigtest/interactor';

@interactor class ApplicationPage {
  doesNotHaveBackend = isPresent('[data-test-eholdings-no-backend]')
  backendNotConfigured = isPresent('[data-test-eholdings-unconfigured-backend]');
  hasBackendLoadError = isPresent('[data-test-eholdings-application-rejected]');
  userNotAssignedKbCredentialsError = isPresent('[data-test-eholdings-user-no-credentials]');
}

export default new ApplicationPage();
