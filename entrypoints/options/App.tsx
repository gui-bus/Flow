import React, { useEffect, useState } from 'react';
import { getProfile, saveProfile } from '../../lib/storage';
import { UserProfile } from '../../types/index';
import logoWhite from '/logo/logo_white.svg';

const BRAZILIAN_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' }
];

const INHIRE_COUNTRIES = [
  'Afeganistão (AF)',
  'África do Sul (ZA)',
  'Albânia (AL)',
  'Alemanha (DE)',
  'Andorra (AD)',
  'Angola (AO)',
  'Anguila (AI)',
  'Antártida (AQ)',
  'Antígua e Barbuda (AG)',
  'Arábia Saudita (SA)',
  'Argélia (DZ)',
  'Argentina (AR)',
  'Arménia (AM)',
  'Aruba (AW)',
  'Austrália (AU)',
  'Áustria (AT)',
  'Azerbaijão (AZ)',
  'Bahamas (BS)',
  'Bahrein (BH)',
  'Bangladesh (BD)',
  'Barbados (BB)',
  'Bélgica (BE)',
  'Belize (BZ)',
  'Benim (BJ)',
  'Bermudas (BM)',
  'Bielorrússia (BY)',
  'Bolívia (BO)',
  'Bósnia-Herzegovina (BA)',
  'Botsuana (BW)',
  'Brasil (BR)',
  'Brunei (BN)',
  'Bulgária (BG)',
  'Burkina Faso (BF)',
  'Burundi (BI)',
  'Butão (BT)',
  'Cabo Verde (CV)',
  'Camboja (KH)',
  'Camarões (CM)',
  'Canadá (CA)',
  'Qatar (QA)',
  'Cazaquistão (KZ)',
  'Chade (TD)',
  'Chéquia (CZ)',
  'Chile (CL)',
  'China (CN)',
  'Chipre (CY)',
  'Colômbia (CO)',
  'Comores (KM)',
  'Coreia do Norte (KP)',
  'Coreia do Sul (KR)',
  'Costa do Marfim (CI)',
  'Costa Rica (CR)',
  'Croácia (HR)',
  'Cuba (CU)',
  'Curaçao (CW)',
  'Dinamarca (DK)',
  'Djibouti (DJ)',
  'Dominica (DM)',
  'Egito (EG)',
  'El Salvador (SV)',
  'Emirados Árabes Unidos (AE)',
  'Equador (EC)',
  'Eritreia (ER)',
  'Eslováquia (SK)',
  'Eslovénia (SI)',
  'Espanha (ES)',
  'Essuatíni (SZ)',
  'Estados Unidos,Estados Unidos da América (US)',
  'Estónia (EE)',
  'Etiópia (ET)',
  'Fiji (FJ)',
  'Filipinas (PH)',
  'Finlândia (FI)',
  'França (FR)',
  'Gabão (GA)',
  'Gâmbia (GM)',
  'Gana (GH)',
  'Geórgia (GE)',
  'Geórgia do Sul e Ilhas Sandwich do Sul (GS)',
  'Gibraltar (GI)',
  'Granada (GD)',
  'Grécia (GR)',
  'Gronelândia (GL)',
  'Guadalupe (GP)',
  'Guam (GU)',
  'Guatemala (GT)',
  'Guernsey (GG)',
  'Guiana (GY)',
  'Guiana Francesa (GF)',
  'Guiné (GN)',
  'Guiné-Bissau (GW)',
  'Guiné Equatorial (GQ)',
  'Haiti (HT)',
  'Honduras (HN)',
  'Hong Kong (HK)',
  'Hungria (HU)',
  'Iémen (YE)',
  'Ilha Bouvet (BV)',
  'Ilha de Natal (CX)',
  'Ilha de Man (IM)',
  'Ilha Norfolk (NF)',
  'Ilhas Åland (AX)',
  'Ilhas Caimão (KY)',
  'Ilhas Cocos (Keeling) (CC)',
  'Ilhas Cook (CK)',
  'Ilhas Distantes dos EUA (UM)',
  'Ilha Heard e Ilhas McDonald (HM)',
  'Ilhas Faroé (FO)',
  'Ilhas Malvinas (FK)',
  'Ilhas Marianas do Norte (MP)',
  'Ilhas Marshall (MH)',
  'Ilhas Pitcairn (PN)',
  'Ilhas Salomão (SB)',
  'Ilhas Turcas e Caicos (TC)',
  'Ilhas Virgens Britânicas (VG)',
  'Ilhas Virgens Americanas (VI)',
  'Índia (IN)',
  'Indonésia (ID)',
  'Irão (IR)',
  'Iraque (IQ)',
  'Irlanda (IE)',
  'Islândia (IS)',
  'Israel (IL)',
  'Itália (IT)',
  'Jamaica (JM)',
  'Japão (JP)',
  'Jersey (JE)',
  'Jordânia (JO)',
  'Kosovo (XK)',
  'Koweit (KW)',
  'Laos (LA)',
  'Lesoto (LS)',
  'Letónia (LV)',
  'Líbano (LB)',
  'Libéria (LR)',
  'Líbia (LY)',
  'Liechtenstein (LI)',
  'Lituânia (LT)',
  'Luxemburgo (LU)',
  'Macau (MO)',
  'Macedónia do Norte (MK)',
  'Madagáscar (MG)',
  'Malásia (MY)',
  'Maláui (MW)',
  'Maldivas (MV)',
  'Mali (ML)',
  'Malta (MT)',
  'Marrocos (MA)',
  'Martinica (MQ)',
  'Maurícia (MU)',
  'Mauritânia (MR)',
  'Mayotte (YT)',
  'México (MX)',
  'Mianmar (Birmânia) (MM)',
  'Micronésia (FM)',
  'Moçambique (MZ)',
  'Moldávia (MD)',
  'Mónaco (MC)',
  'Mongólia (MN)',
  'Montenegro (ME)',
  'Monserrate (MS)',
  'Namíbia (NA)',
  'Nauru (NR)',
  'Nepal (NP)',
  'Nicarágua (NI)',
  'Níger (NE)',
  'Nigéria (NG)',
  'Niue (NU)',
  'Noruega (NO)',
  'Nova Caledónia (NC)',
  'Nova Zelândia (NZ)',
  'Omã (OM)',
  'Países Baixos (NL)',
  'Países Baixos Caribenhos (BQ)',
  'Palau (PW)',
  'Panamá (PA)',
  'Papua-Nova Guiné (PG)',
  'Paquistão (PK)',
  'Paraguai (PY)',
  'Peru (PE)',
  'Polinésia Francesa (PF)',
  'Polónia (PL)',
  'Porto Rico (PR)',
  'Portugal (PT)',
  'Quénia (KE)',
  'Quirguistão (KG)',
  'Quiribati (KI)',
  'Reino Unido (GB)',
  'República Centro-Africana (CF)',
  'República Democrática do Congo (CG)',
  'República Dominicana (DO)',
  'República Popular do Congo (CD)',
  'Reunião (RE)',
  'Roménia (RO)',
  'Ruanda (RW)',
  'Rússia (RU)',
  'Saara Ocidental (EH)',
  'Saint Pierre e Miquelon (PM)',
  'Samoa (WS)',
  'Samoa Americana (AS)',
  'San Marino (SM)',
  'Santa Helena (SH)',
  'Santa Lúcia (LC)',
  'Santa Sé (VA)',
  'São Bartolomeu (BL)',
  'São Cristóvão e Neves (KN)',
  'São Martinho (MF)',
  'São Martinho (SX)',
  'São Tomé e Príncipe (ST)',
  'São Vicente e Granadinas (VC)',
  'Senegal (SN)',
  'Serra Leoa (SL)',
  'Sérvia (RS)',
  'Seychelles (SC)',
  'Singapura (SG)',
  'Síria (SY)',
  'Somália (SO)',
  'Sri Lanka (LK)',
  'Sudão (SD)',
  'Sudão do Sul (SS)',
  'Suécia (SE)',
  'Suíça (CH)',
  'Suriname (SR)',
  'Svalbard e Jan Mayen (SJ)',
  'Tailândia (TH)',
  'Taiwan (TW)',
  'Tajiquistão (TJ)',
  'Tanzânia (TZ)',
  'Terras Austrais e Antárticas Francesas (TF)',
  'Território Britânico do Oceano Índico (IO)',
  'Territórios palestinos (PS)',
  'Timor-Leste (TL)',
  'Togo (TG)',
  'Tokelau (TK)',
  'Tonga (TO)',
  'Trindade e Tobago (TT)',
  'Tunísia (TN)',
  'Turquemenistão (TM)',
  'Turquia (TR)',
  'Tuvalu (TV)',
  'Ucrânia (UA)',
  'Uganda (UG)',
  'Uruguai (UY)',
  'Uzbequistão (UZ)',
  'Vanuatu (VU)',
  'Venezuela (VE)',
  'Vietname (VN)',
  'Wallis e Futuna (WF)',
  'Zâmbia (ZM)',
  'Zimbábue (ZW)'
];

const COMMON_CITIES = [
  'São Paulo - SP',
  'Rio de Janeiro - RJ',
  'São José dos Campos - SP',
  'Belo Horizonte - MG',
  'Curitiba - PR',
  'Porto Alegre - RS',
  'Salvador - BA',
  'Brasília - DF',
  'Campinas - SP',
  'Florianópolis - SC',
  'Fortaleza - CE',
  'Recife - PE',
  'Goiânia - GO',
  'Santos - SP',
  'Sorocaba - SP',
  'Ribeirão Preto - SP',
  'Joinville - SC',
  'Manaus - AM',
  'Belém - PA',
  'Vitória - ES',
  'Natal - RN',
  'João Pessoa - PB',
  'Maceió - AL',
  'Campo Grande - MS',
  'Cuiabá - MT',
  'Aracaju - SE',
  'Teresina - PI',
  'São Luís - MA',
  'Porto Velho - RO',
  'Palmas - TO',
  'Macapá - AP',
  'Rio Branco - AC',
  'Boa Vista - RR'
];

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'demographics'>('personal');
  const [saveStatus, setSaveStatus] = useState<string>('');

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  const handleChange = (key: keyof UserProfile, val: string | boolean) => {
    if (!profile) return;
    setProfile({
      ...profile,
      [key]: val,
    });
  };

  const handleCurrencyChange = (key: 'salaryExpectationClt' | 'salaryExpectationPj', rawVal: string) => {
    if (!profile) return;
    const digits = rawVal.replace(/\D/g, '');
    if (!digits) {
      handleChange(key, '');
      return;
    }
    const cents = parseInt(digits, 10);
    const formatted = (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    handleChange(key, formatted);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    await saveProfile(profile);
    setSaveStatus('Configurações salvas!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F1F1F1] text-slate-700">
        <p className="text-sm font-semibold">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F1F1] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="md:flex">
          
          <div className="md:w-1/3 bg-[#161616] p-8 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-8">
                <img src={logoWhite} alt="Flow Logo" className="h-6 w-auto" />
              </div>
              <p className="text-slate-400 text-xs mb-8 leading-relaxed">
                Configure os seus dados uma única vez para preencher automaticamente as candidaturas.
              </p>
              
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('personal')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'personal' ? 'bg-[#8BCE04] text-[#161616]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Pessoal & Contato
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('professional')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'professional' ? 'bg-[#8BCE04] text-[#161616]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Profissional & Social
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('demographics')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'demographics' ? 'bg-[#8BCE04] text-[#161616]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Respostas Sensíveis & InHire
                </button>
              </nav>
            </div>
            
            <div className="text-[10px] text-slate-500 pt-8 border-t border-slate-800">
              Flow Extension &bull; MVP Local
            </div>
          </div>

          
          <div className="md:w-2/3 p-8 md:p-10 bg-white">
            <form onSubmit={handleSave} className="space-y-6">
              {activeTab === 'personal' && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5">Informações Pessoais</h2>
                  
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome</label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                        placeholder="Guilherme"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sobrenome</label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                        placeholder="Silva"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                      placeholder="Guilherme Silva..."
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">E-mail</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                        placeholder="guilherme@exemplo.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Telefone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                        placeholder="+55 12 99999-9999"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-x-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cidade</label>
                      <input
                        type="text"
                        list="city-options"
                        value={profile.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                        placeholder="São José dos Campos - SP"
                      />
                      <datalist id="city-options">
                        {COMMON_CITIES.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estado</label>
                      <select
                        value={profile.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                      >
                        <option value="">Selecione...</option>
                        {BRAZILIAN_STATES.map((st) => (
                          <option key={st.uf} value={st.uf}>
                            {st.name} ({st.uf})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">País Atual</label>
                    <input
                      type="text"
                      list="country-options"
                      value={profile.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white mb-4"
                      placeholder="Brasil (BR)"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">País de Origem</label>
                    <input
                      type="text"
                      list="country-options"
                      value={profile.countryOrigin}
                      onChange={(e) => handleChange('countryOrigin', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                      placeholder="Brasil (BR)"
                    />
                    <datalist id="country-options">
                      {INHIRE_COUNTRIES.map((cnt) => (
                        <option key={cnt} value={cnt} />
                      ))}
                    </datalist>
                  </div>
                </div>
              )}

              {activeTab === 'professional' && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5">Links & Carreira</h2>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={profile.linkedin}
                      onChange={(e) => handleChange('linkedin', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                      placeholder="https://linkedin.com/in/guilherme"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={profile.github}
                      onChange={(e) => handleChange('github', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                      placeholder="https://github.com/guilherme"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Portfólio URL</label>
                    <input
                      type="url"
                      value={profile.portfolio}
                      onChange={(e) => handleChange('portfolio', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                      placeholder="https://guilherme.dev"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Anos de Experiência</label>
                      <input
                        type="number"
                        value={profile.experienceYears}
                        onChange={(e) => handleChange('experienceYears', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pretensão CLT</label>
                      <input
                        type="text"
                        value={profile.salaryExpectationClt}
                        onChange={(e) => handleCurrencyChange('salaryExpectationClt', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white font-medium"
                        placeholder="R$ 4.000,00"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pretensão PJ</label>
                      <input
                        type="text"
                        value={profile.salaryExpectationPj}
                        onChange={(e) => handleCurrencyChange('salaryExpectationPj', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white font-medium"
                        placeholder="R$ 6.000,00"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'demographics' && (
                <div className="space-y-5 animate-fade-in max-h-[500px] overflow-y-auto pr-2">
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs text-amber-800 leading-relaxed">
                    <strong>Aviso de Privacidade:</strong> Essas informações são comumente solicitadas em formulários de diversidade e demografia. Preencha apenas se desejar automatizar estes campos. Se houver dúvida ou o Flow não tiver certeza, o campo será ignorado para sua revisão manual.
                  </div>

                  <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5">Perguntas Sensíveis</h2>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Qual é a sua identidade de gênero?</label>
                    <select
                      value={profile.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                    >
                      <option value="">Selecione uma opção...</option>
                      <option value="Homem cisgênero">Homem cisgênero</option>
                      <option value="Mulher cisgênero">Mulher cisgênero</option>
                      <option value="Homem transgênero">Homem transgênero</option>
                      <option value="Mulher transgênero">Mulher transgênero</option>
                      <option value="Não-binário">Não-binário</option>
                      <option value="Prefiro não responder">Prefiro não responder</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Qual é a sua orientação sexual?</label>
                    <select
                      value={profile.sexualOrientation}
                      onChange={(e) => handleChange('sexualOrientation', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                    >
                      <option value="">Selecione uma opção...</option>
                      <option value="Heterossexual">Heterossexual</option>
                      <option value="Homossexual (Gay / Lésbica)">Homossexual (Gay / Lésbica)</option>
                      <option value="Bissexual">Bissexual</option>
                      <option value="Pansexual">Pansexual</option>
                      <option value="Assexual">Assexual</option>
                      <option value="Outro">Outro</option>
                      <option value="Prefiro não responder">Prefiro não responder</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Qual é a sua cor ou raça?</label>
                    <select
                      value={profile.race}
                      onChange={(e) => handleChange('race', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                    >
                      <option value="">Selecione uma opção...</option>
                      <option value="Branca">Branca</option>
                      <option value="Parda">Parda</option>
                      <option value="Preta">Preta</option>
                      <option value="Amarela">Amarela</option>
                      <option value="Indígena">Indígena</option>
                      <option value="Prefiro não responder">Prefiro não responder</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deseja se candidatar para a vaga como pessoa com deficiência?</label>
                    <select
                      value={profile.disability || profile.isPcdCandidate}
                      onChange={(e) => {
                        handleChange('disability', e.target.value);
                        handleChange('isPcdCandidate', e.target.value);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                    >
                      <option value="">Selecione uma opção...</option>
                      <option value="Não">Não</option>
                      <option value="Sim">Sim</option>
                    </select>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Você pertence a um dos grupos abaixo?</label>
                    
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.groupPreto}
                          onChange={(e) => handleChange('groupPreto', e.target.checked)}
                          className="rounded border-slate-300 text-[#8BCE04] focus:ring-[#8BCE04]"
                        />
                        Pessoa preta
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.groupPardo}
                          onChange={(e) => handleChange('groupPardo', e.target.checked)}
                          className="rounded border-slate-300 text-[#8BCE04] focus:ring-[#8BCE04]"
                        />
                        Pessoa parda
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.groupIndigena}
                          onChange={(e) => handleChange('groupIndigena', e.target.checked)}
                          className="rounded border-slate-300 text-[#8BCE04] focus:ring-[#8BCE04]"
                        />
                        Indígena
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.groupMulher}
                          onChange={(e) => handleChange('groupMulher', e.target.checked)}
                          className="rounded border-slate-300 text-[#8BCE04] focus:ring-[#8BCE04]"
                        />
                        Mulher
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.groupPcd}
                          onChange={(e) => handleChange('groupPcd', e.target.checked)}
                          className="rounded border-slate-300 text-[#8BCE04] focus:ring-[#8BCE04]"
                        />
                        Pessoa com Deficiência
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.groupLgbt}
                          onChange={(e) => handleChange('groupLgbt', e.target.checked)}
                          className="rounded border-slate-300 text-[#8BCE04] focus:ring-[#8BCE04]"
                        />
                        LGBTI+
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.groupNone}
                          onChange={(e) => handleChange('groupNone', e.target.checked)}
                          className="rounded border-slate-300 text-[#8BCE04] focus:ring-[#8BCE04]"
                        />
                        Não pertenço a nenhum
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.groupNoAnswer}
                          onChange={(e) => handleChange('groupNoAnswer', e.target.checked)}
                          className="rounded border-slate-300 text-[#8BCE04] focus:ring-[#8BCE04]"
                        />
                        Prefiro não responder
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Foi indicado por alguém da empresa?</label>
                      <select
                        value={profile.referredBySomeone}
                        onChange={(e) => handleChange('referredBySomeone', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                      >
                        <option value="Não">Não</option>
                        <option value="Sim">Sim</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome de quem te indicou (caso aplicável)</label>
                      <input
                        type="text"
                        value={profile.referredByName}
                        onChange={(e) => handleChange('referredByName', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                        placeholder=""
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Autorização de Trabalho</label>
                      <input
                        type="text"
                        value={profile.workAuthorization}
                        onChange={(e) => handleChange('workAuthorization', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                        placeholder="Sim, tenho autorização no país da vaga"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Disponibilidade</label>
                      <input
                        type="text"
                        value={profile.availability}
                        onChange={(e) => handleChange('availability', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                        placeholder="Imediata"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Concordo com a Política de Privacidade/LGPD</label>
                      <select
                        value={profile.rgpdConsent}
                        onChange={(e) => handleChange('rgpdConsent', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-xs text-slate-800 bg-white"
                      >
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                {saveStatus ? (
                  <span className="text-xs font-semibold text-emerald-600">{saveStatus}</span>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#8BCE04] hover:bg-[#7ab503] text-[#161616] font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Salvar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

