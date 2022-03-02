import React, {useContext} from 'react';
import Wizard from './Wizard';
import {useStream} from "ui/effects";
import {AppContext} from "cad/dom/components/AppContext";
import {ErrorBoundary} from "ui/errorBoundary";

export default function WizardManager() {

  const ctx = useContext(AppContext);
  const workingRequest = useStream(ctx => ctx.wizardService.workingRequest$);

  if (!workingRequest) {
    return null;
  }

  return <ErrorBoundary key={workingRequest.requestKey}
                        message={<span>operation error</span>}>
    <Wizard noFocus={workingRequest.hints?.noWizardFocus}
            onCancel={ctx.craftService.isEditingHistory ? ctx.craftService.historyTravel.end : ctx.wizardService.cancel}
            onOK={ctx.wizardService.applyWorkingRequest} />
  </ErrorBoundary>
}
