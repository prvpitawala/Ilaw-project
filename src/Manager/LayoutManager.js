/**
 * LayoutManager - Manages component stages and layout techniques
 */
import { STAGES } from './constants.js';

export class LayoutManager {
  constructor() {
    // Map to track current state of components
    this.componentStates = new Map();
  }

  /**
   * Set component to a specific stage
   * @param {HTMLElement} component - DOM element to modify
   * @param {string} stage - Stage to set (from STAGES)
   */
  setComponentStage(component, stage) {
    if (!component) return;
    
    // Get current stage if tracked
    const currentStage = this.componentStates.get(component.id);
    
    // If already in the requested stage, do nothing
    if (currentStage === stage) return;
    
    // Remove all stage classes
    component.classList.remove(STAGES.HIDDEN, STAGES.PRIMARY, STAGES.SECONDARY);
    
    // Add the new stage class
    component.classList.add(stage);
    
    // Update state tracking
    this.componentStates.set(component.id, stage);
  }

  /**
   * Switch two components' stages (typically PRIMARY <-> SECONDARY)
   * @param {HTMLElement} component1 - First component
   * @param {HTMLElement} component2 - Second component
   */
  swapComponentStages(component1, component2) {
    if (!component1 || !component2) return;
    
    const stage1 = this.componentStates.get(component1.id);
    const stage2 = this.componentStates.get(component2.id);
    
    this.setComponentStage(component1, stage2);
    this.setComponentStage(component2, stage1);
  }

  /**
   * Set component to PRIMARY stage, hiding any current PRIMARY
   * @param {HTMLElement} component - Component to make primary
   */
  setAsPrimary(component) {
    if (!component) return;
    
    // First check if any component is currently primary
    this.componentStates.forEach((stage, id) => {
      if (stage === STAGES.PRIMARY && id !== component.id) {
        // Set current primary to hidden
        const currentPrimary = document.getElementById(id);
        this.setComponentStage(currentPrimary, STAGES.HIDDEN);
      }
    });
    
    // Set the requested component to primary
    this.setComponentStage(component, STAGES.PRIMARY);
  }

  /**
   * Adjust layout for responsive design or specific scenarios
   * @param {string} layoutMode - Layout mode to apply
   */
  applyLayoutMode(layoutMode) {
    // Example implementation - can be expanded based on requirements
    document.body.dataset.layoutMode = layoutMode;
  }
}