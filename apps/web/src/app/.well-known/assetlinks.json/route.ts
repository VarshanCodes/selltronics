import { NextResponse } from 'next/server';

export async function GET() {
  const assetLinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'com.selltronics.app',
        sha256_cert_fingerprints: [
          'be:e7:9e:66:91:4d:6b:ba:20:47:61:fc:d0:af:6d:f7:28:12:7a:57:ec:fd:59:f3:5d:ac:24:72:c0:f6:4a:63',
        ],
      },
    },
  ];

  return NextResponse.json(assetLinks, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
