// eslint-disable-next-line no-unused-vars
module.exports.parse = async (raw, { axios, yaml, notify, console }, { name, url, interval, selected }) => {
    const obj = yaml.parse(raw);
    const CUSTOM_RULES = [
        'DOMAIN-SUFFIX,maqicxu.com,🔰国外流量',
        'DOMAIN-SUFFIX,199258.xyz,🔰国外流量',
        'DOMAIN-KEYWORD,openai-us,🇺🇸美国节点',
    ];
    const usProxyGroup = {
        name: '🇺🇸美国节点',
        type: 'select',
        proxies: obj.proxies.map(p => p.name).filter(name => name.includes('US')),
    };

    const OPENAI_REMOTE_RULE = 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/OpenAI/OpenAI.yaml';

    let openaiRules = [];
    try {
        const openaiRulesText = await axios.get(OPENAI_REMOTE_RULE).then(res => res.data);
        openaiRules = yaml.parse(openaiRulesText).payload.map(el => `${el},${usProxyGroup.name}`);
    } catch (err) {
        notify('获取 OpenAI 规则失败', err.message);
    }

    // remove rules startWith IP-ASN
    obj.rules = [
        ...CUSTOM_RULES,
        ...openaiRules,
        ...obj.rules,
    ].filter(el => !el.startsWith('IP_ASN'));

    obj['proxy-groups'] = [
        ...obj['proxy-groups'],
        usProxyGroup,
    ];

    return yaml.stringify(obj);
}
