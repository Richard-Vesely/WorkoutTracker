// Enhanced error handling for better browser compatibility
export class ErrorHandler {
  private static errorContainer: HTMLElement | null = null

  static showError(message: string, title: string = 'Error') {
    console.error(`${title}:`, message)
    
    // Try to show a custom error modal instead of alert
    this.showCustomError(message, title)
  }

  static showSuccess(message: string, title: string = 'Success') {
    console.log(`${title}:`, message)
    
    // Try to show a custom success modal instead of alert
    this.showCustomSuccess(message, title)
  }

  static showWarning(message: string, title: string = 'Warning') {
    console.warn(`${title}:`, message)
    
    // Try to show a custom warning modal instead of alert
    this.showCustomWarning(message, title)
  }

  private static showCustomError(message: string, title: string) {
    // Create or get error container
    if (!this.errorContainer) {
      this.errorContainer = document.createElement('div')
      this.errorContainer.id = 'error-handler-container'
      this.errorContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `
      document.body.appendChild(this.errorContainer)
    }

    // Create error modal
    const modal = document.createElement('div')
    modal.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      text-align: center;
    `

    modal.innerHTML = `
      <div style="color: #dc2626; font-size: 24px; margin-bottom: 16px;">⚠️</div>
      <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">${title}</h3>
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px 0; line-height: 1.5;">${message}</p>
      <button id="error-ok-btn" style="
        background: #dc2626;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      " onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
        OK
      </button>
    `

    this.errorContainer.innerHTML = ''
    this.errorContainer.appendChild(modal)

    // Add click handler
    const okBtn = modal.querySelector('#error-ok-btn') as HTMLButtonElement
    okBtn.onclick = () => {
      this.errorContainer!.style.display = 'none'
    }

    // Show modal
    this.errorContainer.style.display = 'flex'
  }

  private static showCustomSuccess(message: string, title: string) {
    if (!this.errorContainer) {
      this.errorContainer = document.createElement('div')
      this.errorContainer.id = 'error-handler-container'
      this.errorContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `
      document.body.appendChild(this.errorContainer)
    }

    const modal = document.createElement('div')
    modal.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      text-align: center;
    `

    modal.innerHTML = `
      <div style="color: #059669; font-size: 24px; margin-bottom: 16px;">✅</div>
      <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">${title}</h3>
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px 0; line-height: 1.5;">${message}</p>
      <button id="success-ok-btn" style="
        background: #059669;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      " onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">
        OK
      </button>
    `

    this.errorContainer.innerHTML = ''
    this.errorContainer.appendChild(modal)

    const okBtn = modal.querySelector('#success-ok-btn') as HTMLButtonElement
    okBtn.onclick = () => {
      this.errorContainer!.style.display = 'none'
    }

    this.errorContainer.style.display = 'flex'
  }

  private static showCustomWarning(message: string, title: string) {
    if (!this.errorContainer) {
      this.errorContainer = document.createElement('div')
      this.errorContainer.id = 'error-handler-container'
      this.errorContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `
      document.body.appendChild(this.errorContainer)
    }

    const modal = document.createElement('div')
    modal.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      text-align: center;
    `

    modal.innerHTML = `
      <div style="color: #d97706; font-size: 24px; margin-bottom: 16px;">⚠️</div>
      <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">${title}</h3>
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px 0; line-height: 1.5;">${message}</p>
      <button id="warning-ok-btn" style="
        background: #d97706;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      " onmouseover="this.style.background='#b45309'" onmouseout="this.style.background='#d97706'">
        OK
      </button>
    `

    this.errorContainer.innerHTML = ''
    this.errorContainer.appendChild(modal)

    const okBtn = modal.querySelector('#warning-ok-btn') as HTMLButtonElement
    okBtn.onclick = () => {
      this.errorContainer!.style.display = 'none'
    }

    this.errorContainer.style.display = 'flex'
  }
}

// Fallback to alert if custom modals fail
export const showError = (message: string, title: string = 'Error') => {
  try {
    ErrorHandler.showError(message, title)
  } catch (error) {
    console.error('Custom error handler failed, falling back to alert:', error)
    alert(`${title}: ${message}`)
  }
}

export const showSuccess = (message: string, title: string = 'Success') => {
  try {
    ErrorHandler.showSuccess(message, title)
  } catch (error) {
    console.error('Custom success handler failed, falling back to alert:', error)
    alert(`${title}: ${message}`)
  }
}

export const showWarning = (message: string, title: string = 'Warning') => {
  try {
    ErrorHandler.showWarning(message, title)
  } catch (error) {
    console.error('Custom warning handler failed, falling back to alert:', error)
    alert(`${title}: ${message}`)
  }
}
