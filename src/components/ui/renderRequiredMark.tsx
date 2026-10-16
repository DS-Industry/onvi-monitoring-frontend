import React from 'react';

/** Colors each required-field asterisk without changing spaces, commas, or other characters. */
export function renderRequiredMark(text: string): React.ReactNode {
  if (!text.includes('*')) return text;

  const parts = text.split('*');

  return parts.map((part, index) => (
    <React.Fragment key={index}>
      {part}
      {index < parts.length - 1 ? (
        <span className="!text-errorFill">*</span>
      ) : null}
    </React.Fragment>
  ));
}
