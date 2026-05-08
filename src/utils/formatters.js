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
  const numericValue =
    typeof value === 'number'
      ? value
      : Number(String(value).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));

  if (Number.isNaN(numericValue)) {
    return value || 'Não informado';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
}

export function formatMonthDate(dateString) {
  if (!dateString) {
    return 'Não informado';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
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
