import { hashProperty, sharedStyles } from '@holochain-open-dev/elements';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import { StoreSubscriber } from '@holochain-open-dev/stores';
import { EntryRecord } from '@holochain-open-dev/utils';
import { ActionHash, EntryHash, Record } from '@holochain/client';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { CancellationsStore } from '../cancellations-store.js';
import { cancellationsStoreContext } from '../context.js';
import { Cancellation } from '../types.js';

/**
 * @element cancellation-summary
 * @fires cancellation-selected: detail will contain { cancellationHash }
 */
@localized()
@customElement('cancellation-summary')
export class CancellationSummary extends LitElement {
  // REQUIRED. The hash of the Cancellation to show
  @property(hashProperty('cancellation-hash'))
  cancellationHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: cancellationsStoreContext, subscribe: true })
  cancellationsStore!: CancellationsStore;

  /**
   * @internal
   */
  _cancellation = new StoreSubscriber(
    this,
    () =>
      this.cancellationsStore.cancellations.get(this.cancellationHash)
        .latestVersion,
    () => [this.cancellationHash]
  );

  renderSummary(entryRecord: EntryRecord<Cancellation>) {
    return html`
      <div style="display: flex; flex-direction: column">
        <div style="display: flex; flex-direction: column; margin-bottom: 16px">
          <span style="margin-bottom: 8px"
            ><strong>${msg('Reason')}</strong></span
          >
          <span style="white-space: pre-line">${entryRecord.entry.reason}</span>
        </div>
      </div>
    `;
  }

  renderCancellation() {
    switch (this._cancellation.value.status) {
      case 'pending':
        return html`<div
          style="display: flex; flex: 1; align-items: center; justify-content: center"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`;
      case 'complete':
        if (!this._cancellation.value.value)
          return html`<span
            >${msg("The requested cancellation doesn't exist")}</span
          >`;

        return this.renderSummary(this._cancellation.value.value);
      case 'error':
        return html`<display-error
          .headline=${msg('Error fetching the cancellation')}
          .error=${this._cancellation.value.error}
        ></display-error>`;
    }
  }

  render() {
    return html`<sl-card
      style="flex: 1; cursor: grab;"
      @click=${() =>
        this.dispatchEvent(
          new CustomEvent('cancellation-selected', {
            composed: true,
            bubbles: true,
            detail: {
              cancellationHash: this.cancellationHash,
            },
          })
        )}
    >
      ${this.renderCancellation()}
    </sl-card>`;
  }

  static styles = [sharedStyles];
}
