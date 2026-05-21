export function formatDateTime(dateString) {
  if (!dateString) {
    return 'Não informado';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateString));
}

export function formatDate(dateString) {
  if (!dateString) {
    return 'Não informado';
  }

  const isoDateOnly = parseIsoDateOnly(dateString);
  if (isoDateOnly) {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
    }).format(isoDateOnly);
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(dateString));
}

export function formatMonthYear(dateString) {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function formatCurrency(value) {
  const numericValue = parseCurrencyValue(value);

  if (Number.isNaN(numericValue)) {
    return value || 'Não informado';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
}

export function formatCurrencyInput(value) {
  if (value === '' || value == null) {
    return '';
  }

  if (typeof value === 'number') {
    return String(value).replace('.', ',');
  }

  const stringValue = String(value).trim();
  if (stringValue.includes(',')) {
    return stringValue;
  }

  if (/^-?\d+\.\d{1,2}$/.test(stringValue)) {
    return stringValue.replace('.', ',');
  }

  return stringValue;
}

export function formatMonthDate(dateString) {
  if (!dateString) {
    return 'Não informado';
  }

  const isoDateOnly = parseIsoDateOnly(dateString);
  const date = isoDateOnly ?? new Date(dateString);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function monthKey(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatInputDateTime(dateString) {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

export function formatInputDate(dateString) {
  if (!dateString) {
    return '';
  }

  const value = String(dateString);
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }

  return value;
}

export function parseDateInputToIso(value) {
  if (!value) {
    return null;
  }

  const trimmedValue = String(value).trim();
  const brMatch = trimmedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
  }

  const isoMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  return trimmedValue;
}

export function parseCurrencyValue(value) {
  if (value === '' || value == null) {
    return Number.NaN;
  }

  if (typeof value === 'number') {
    return value;
  }

  const normalizedValue = String(value).trim().replace(/[^\d,.-]/g, '');
  const hasComma = normalizedValue.includes(',');
  const hasDot = normalizedValue.includes('.');

  if (hasComma) {
    return Number(normalizedValue.replace(/\./g, '').replace(',', '.'));
  }

  if (hasDot) {
    const dotParts = normalizedValue.split('.');
    const lastPart = dotParts.at(-1) ?? '';
    if (dotParts.length > 2 || lastPart.length === 3) {
      return Number(normalizedValue.replace(/\./g, ''));
    }
  }

  return Number(normalizedValue);
}

export function isWithinDateRange(dateString, startDate, endDate) {
  const time = new Date(dateString).getTime();

  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`).getTime();
    if (time < start) {
      return false;
    }
  }

  if (endDate) {
    const end = new Date(`${endDate}T23:59:59`).getTime();
    if (time > end) {
      return false;
    }
  }

  return true;
}

function parseIsoDateOnly(dateString) {
  const match = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return null;
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}
