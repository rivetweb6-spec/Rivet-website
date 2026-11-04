/** Controls marked invalid by the public forms (fields, textareas, the category picker). */
const INVALID_CONTROL =
  'input[aria-invalid="true"], textarea[aria-invalid="true"], select[aria-invalid="true"], [role="group"][aria-invalid="true"] input';

/**
 * After a failed submit, move keyboard and screen-reader focus to the first
 * field with an error, so the user lands on what needs fixing instead of
 * staying on the submit button. Runs on the next frame, after React has
 * rendered the error state.
 */
export function focusFirstInvalid(form: HTMLFormElement | null): void {
  if (!form) return;
  requestAnimationFrame(() => {
    form.querySelector<HTMLElement>(INVALID_CONTROL)?.focus();
  });
}
