// eslint-disable-next-line no-unused-vars
module.exports.parse = async (raw, { axios, yaml, notify, console }, { name, url, interval, selected }) => {
    const obj = yaml.parse(raw);
    const CUSTOM_RULES = [
        'DOMAIN-SUFFIX,maqicxu.com,🔰国外流量',
        'DOMAIN-SUFFIX,199258.xyz,🔰国外流量',
        'DOMAIN-SUFFIX,visualstudio.com,🔰国外流量',
        'DOMAIN-KEYWORD,openai-us,🇺🇸美国节点',
    ];
    const usProxyGroup = {
        name: '🇺🇸美国节点',
        type: 'select',
        proxies: obj.proxies.map(p => p.name).filter(name => name.includes('US')),
    };

    const US_REMOTE_RULE = [
        'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/OpenAI/OpenAI.yaml',
        'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Claude/Claude.yaml',
    ];
    let usRules = [];

    try {
        const ruleCollection = await Promise.all(US_REMOTE_RULE.map(url => axios.get(url).then(res => res.data)));
        const payload = ruleCollection.map(yaml.parse).map(el => el.payload).flat();
        usRules = payload.map(el => `${el},${usProxyGroup.name}`);
    } catch (err) {
        notify('remote rules failed', err.message);
    }

    // remove rules startWith IP-ASN
    obj.rules = [
        ...CUSTOM_RULES,
        ...usRules,
        ...obj.rules,
    ].filter(el => !el.startsWith('IP-ASN'));

    obj['proxy-groups'] = [
        ...obj['proxy-groups'],
        usProxyGroup,
    ];

    return yaml.stringify(obj);
}
