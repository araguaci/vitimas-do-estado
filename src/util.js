export function esc(s) {
  if (s == null || s === undefined) return '';
  const d = document.createElement('div');
  d.textContent = String(s);
  return d.innerHTML;
}

export const failureTypePt = {
  preventive_detention_death: 'Morte em prisão preventiva',
  judicial_omission: 'Omissão judicial',
  medical_negligence_in_custody: 'Negligência médica em custódia',
  police_lethality: 'Letalidade policial',
  impunity_of_aggressor: 'Impunidade do agressor',
  institutional_retaliation: 'Retaliação institucional',
  failure_to_protect_witness: 'Falha em proteger testemunha/vítima',
  state_custody_failure: 'Falha em custódia estatal',
  state_law_as_weapon: 'Lei estatal como arma',
};

export function ftLabel(key) {
  return failureTypePt[key] || key;
}
