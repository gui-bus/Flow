import { FieldType, ConfidenceLevel } from '../../types/index';

export abstract class BaseAdapter {
  protected matchKeywords(text: string, keywords: string[]): boolean {
    const normalized = text.toLowerCase().trim();
    return keywords.some(keyword => {
      const kw = keyword.toLowerCase();
      return normalized === kw || 
             normalized.includes(` ${kw} `) || 
             normalized.startsWith(`${kw} `) || 
             normalized.endsWith(` ${kw}`) ||
             normalized.replace(/[^\w\s]/g, '').includes(kw);
    });
  }

  protected getLabelText(el: HTMLElement): string {
    if (el.id) {
      const label = document.querySelector(`label[for="${el.id}"]`);
      if (label && label.textContent) {
        return label.textContent.trim();
      }
    }
    const parent = el.closest('label');
    if (parent && parent.textContent) {
      return parent.textContent.trim();
    }
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel.trim();
    
    const ariaLabelledBy = el.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labeled = document.getElementById(ariaLabelledBy);
      if (labeled && labeled.textContent) {
        return labeled.textContent.trim();
      }
    }

    const previous = el.previousElementSibling;
    if (previous && (previous.tagName === 'LABEL' || previous.tagName === 'SPAN' || previous.tagName === 'DIV')) {
      if (previous.textContent) return previous.textContent.trim();
    }

    return '';
  }

  protected determineFieldType(
    name: string,
    id: string,
    placeholder: string,
    label: string,
    type: string
  ): { fieldType: FieldType; confidence: ConfidenceLevel; reason: string } | null {
    const emailKeywords = ['email', 'e-mail', 'correoe'];
    const phoneKeywords = ['phone', 'telefone', 'celular', 'mobile', 'tel', 'whatsapp', 'contato'];
    
    const firstNameKeywords = ['first name', 'nome', 'first_name', 'given name', 'prenome'];
    const lastNameKeywords = ['last name', 'sobrenome', 'last_name', 'family name', 'cognome'];
    const fullNameKeywords = ['full name', 'nome completo', 'full_name', 'nombre completo'];
    
    const linkedinKeywords = ['linkedin', 'linked-in'];
    const githubKeywords = ['github', 'git-hub'];
    const portfolioKeywords = ['portfolio', 'portfólio', 'website', 'personal site', 'site pessoal', 'personal page'];
    
    const cityKeywords = ['city', 'cidade', 'municipio'];
    const stateKeywords = ['state', 'estado', 'provincia', 'uf'];
    const countryKeywords = ['country', 'país', 'nacion'];
    
    const salaryKeywords = ['salary', 'pretensão salarial', 'pretensao', 'remuneração', 'remuneracao', 'expectation', 'pretensão'];
    const experienceKeywords = ['experience', 'experiência', 'experiencia', 'years of', 'anos de'];

    const countryOriginKeywords = ['país de origem', 'pais de origem', 'país natal', 'origem'];
    const genderKeywords = ['gender', 'gênero', 'genero', 'sexo', 'identidade de gênero'];
    
    const salaryKeywordsClt = ['pretensão salarial como clt', 'pretensao salarial como clt', 'clt', 'pretensão clt'];
    const salaryKeywordsPj = ['pretensão salarial como pj', 'pretensao salarial como pj', 'pj', 'pretensão pj'];
    
    const raceKeywords = ['race', 'ethnicity', 'raça', 'cor', 'etnia', 'raca', 'cor ou raça'];
    const disabilityKeywords = ['disability', 'pcd', 'deficiência', 'deficiencia', 'disabled', 'pessoa com deficiência'];
    const authKeywords = ['authorization', 'authorized to work', 'visa', 'autorização para trabalhar', 'autorizacao'];
    const availabilityKeywords = ['availability', 'disponibilidade', 'notice period', 'start date'];
    
    const sexualOrientationKeywords = ['orientação sexual', 'orientacao sexual', 'sexual orientation'];
    const pcdCandidateKeywords = ['candidatar para a vaga como pessoa com deficiência', 'candidatar como pcd', 'candidatar-se como pcd', 'candidatar como pessoa com deficiencia'];
    const referralKeywords = ['indicado por', 'indicado por alguém', 'indicação', 'indicacao', 'referral', 'indicado'];
    const lgbtqiaKeywords = ['pertence a um dos grupos', 'lgbti', 'lgbtqia', 'grupo de diversidade'];
    const rgpdKeywords = ['concorda com o que está descrito', 'politica de privacidade', 'política de privacidade', 'termo', 'consent', 'lgpd'];

    
    const pretoKeywords = ['pessoa preta'];
    const pardoKeywords = ['pessoa parda'];
    const indigenaKeywords = ['indígena', 'indigena'];
    const mulherKeywords = ['mulher'];
    const pcdKeywords = ['pessoa com deficiência', 'pessoa com deficiencia'];
    const lgbtKeywords = ['lgbti', 'lgbtqia', 'lgbti+'];
    const noneKeywords = ['não pertenço a nenhum dos grupos', 'nao pertenço a nenhum dos grupos'];
    const noAnswerKeywords = ['prefiro não responder', 'prefiro nao responder'];

    const contexts = [
      { type: 'email' as FieldType, keywords: emailKeywords, weight: 1.0 },
      { type: 'phone' as FieldType, keywords: phoneKeywords, weight: 1.0 },
      { type: 'linkedin' as FieldType, keywords: linkedinKeywords, weight: 1.2 },
      { type: 'github' as FieldType, keywords: githubKeywords, weight: 1.2 },
      { type: 'portfolio' as FieldType, keywords: portfolioKeywords, weight: 1.0 },
      { type: 'fullName' as FieldType, keywords: fullNameKeywords, weight: 1.1 },
      { type: 'firstName' as FieldType, keywords: firstNameKeywords, weight: 1.0 },
      { type: 'lastName' as FieldType, keywords: lastNameKeywords, weight: 1.0 },
      { type: 'city' as FieldType, keywords: cityKeywords, weight: 1.0 },
      { type: 'state' as FieldType, keywords: stateKeywords, weight: 1.0 },
      { type: 'country' as FieldType, keywords: countryKeywords, weight: 1.0 },
      { type: 'countryOrigin' as FieldType, keywords: countryOriginKeywords, weight: 1.2 },
      { type: 'salaryExpectationClt' as FieldType, keywords: salaryKeywordsClt, weight: 1.2 },
      { type: 'salaryExpectationPj' as FieldType, keywords: salaryKeywordsPj, weight: 1.2 },
      { type: 'experienceYears' as FieldType, keywords: experienceKeywords, weight: 1.0 },
      { type: 'gender' as FieldType, keywords: genderKeywords, weight: 1.2 },
      { type: 'race' as FieldType, keywords: raceKeywords, weight: 1.2 },
      { type: 'disability' as FieldType, keywords: disabilityKeywords, weight: 1.2 },
      { type: 'workAuthorization' as FieldType, keywords: authKeywords, weight: 1.2 },
      { type: 'availability' as FieldType, keywords: availabilityKeywords, weight: 1.0 },
      { type: 'sexualOrientation' as FieldType, keywords: sexualOrientationKeywords, weight: 1.2 },
      { type: 'isPcdCandidate' as FieldType, keywords: pcdCandidateKeywords, weight: 1.5 },
      { type: 'referredBySomeone' as FieldType, keywords: referralKeywords, weight: 1.2 },
      { type: 'lgbtqia' as FieldType, keywords: lgbtqiaKeywords, weight: 1.2 },
      { type: 'rgpdConsent' as FieldType, keywords: rgpdKeywords, weight: 1.2 },
      
      { type: 'groupPreto' as FieldType, keywords: pretoKeywords, weight: 1.5 },
      { type: 'groupPardo' as FieldType, keywords: pardoKeywords, weight: 1.5 },
      { type: 'groupIndigena' as FieldType, keywords: indigenaKeywords, weight: 1.5 },
      { type: 'groupMulher' as FieldType, keywords: mulherKeywords, weight: 1.5 },
      { type: 'groupPcd' as FieldType, keywords: pcdKeywords, weight: 1.5 },
      { type: 'groupLgbt' as FieldType, keywords: lgbtKeywords, weight: 1.5 },
      { type: 'groupNone' as FieldType, keywords: noneKeywords, weight: 1.5 },
      { type: 'groupNoAnswer' as FieldType, keywords: noAnswerKeywords, weight: 1.5 },
    ];

    if (type === 'email') return { fieldType: 'email', confidence: 'HIGH', reason: 'Input type is email' };
    if (type === 'tel') return { fieldType: 'phone', confidence: 'HIGH', reason: 'Input type is tel' };
    if (type === 'url') {
      for (const ctx of contexts) {
        if (['linkedin', 'github', 'portfolio'].includes(ctx.type)) {
          if (this.matchKeywords(name, ctx.keywords) || this.matchKeywords(id, ctx.keywords) || this.matchKeywords(placeholder, ctx.keywords) || this.matchKeywords(label, ctx.keywords)) {
            return { fieldType: ctx.type, confidence: 'HIGH', reason: `Input type is url matching ${ctx.type}` };
          }
        }
      }
    }

    for (const ctx of contexts) {
      let score = 0;
      if (name && this.matchKeywords(name, ctx.keywords)) score += 3;
      if (id && this.matchKeywords(id, ctx.keywords)) score += 3;
      if (label && this.matchKeywords(label, ctx.keywords)) score += 4;
      if (placeholder && this.matchKeywords(placeholder, ctx.keywords)) score += 2;

      if (score >= 6) {
        return {
          fieldType: ctx.type,
          confidence: 'HIGH',
          reason: `High confidence match on label or identifiers (${ctx.type})`
        };
      } else if (score >= 3) {
        return {
          fieldType: ctx.type,
          confidence: 'MEDIUM',
          reason: `Medium confidence match on identifiers (${ctx.type})`
        };
      } else if (score >= 2) {
        return {
          fieldType: ctx.type,
          confidence: 'LOW',
          reason: `Low confidence match on placeholder/context (${ctx.type})`
        };
      }
    }

    if (this.matchKeywords(label, ['first name', 'sobrenome', 'nome'])) {
      if (this.matchKeywords(label, ['first', 'given'])) return { fieldType: 'firstName', confidence: 'HIGH', reason: 'Label contains first name' };
      if (this.matchKeywords(label, ['last', 'sobrenome'])) return { fieldType: 'lastName', confidence: 'HIGH', reason: 'Label contains last name' };
      return { fieldType: 'fullName', confidence: 'MEDIUM', reason: 'Generic name identifier matches' };
    }

    return null;
  }

  protected getSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    if (el.getAttribute('name')) return `${el.tagName.toLowerCase()}[name="${el.getAttribute('name')}"]`;
    const parent = el.parentElement;
    if (parent) {
      const index = Array.from(parent.children).indexOf(el);
      return `${parent.tagName.toLowerCase()} > ${el.tagName.toLowerCase()}:nth-child(${index + 1})`;
    }
    return el.tagName.toLowerCase();
  }
}
