module.exports.parse = async (raw, { axios, yaml, notify, console }, { name, url, interval, selected }) => {
    const obj = yaml.parse(raw);
    const CUSTOM_RULES = [
        'DOMAIN-SUFFIX,maqicxu.com,🔰国外流量',
        'DOMAIN-SUFFIX,199258.xyz,🔰国外流量',
    ];
    const v4Proxies = obj.proxies.filter(p => p.name.includes('V4'));
    const usProxyGroup = {
        name: '🇺🇸美国节点',
        type: 'select',
        proxies: v4Proxies.map(p => p.name).filter(name => name.includes('US')),
    };

    const OPENAI_REMOTE_RULE = 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/OpenAI/OpenAI.yaml';

    let openaiRules = [];
    try {
        const openaiRulesText = await axios.get(OPENAI_REMOTE_RULE).then(res => res.data);
        openaiRules = yaml.parse(openaiRulesText).payload.map(el => `${el},${usProxyGroup.name}`);
    } catch (err) {
        notify('获取 OpenAI 规则失败', err.message);
    }

    obj.rules = [
        ...CUSTOM_RULES,
        ...openaiRules,
        ...obj.rules,
    ];
    obj.proxies = v4Proxies;
    obj['proxy-groups'] = [
        ...obj['proxy-groups'],
        usProxyGroup,
    ].map(g => {
        // remove all V3 proxies
        g.proxies = g.proxies.filter(p => !p.includes('V3'));

        return g;
    });

    return yaml.stringify(obj);
}