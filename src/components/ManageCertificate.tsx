import React, { useEffect, useState } from 'react';
import { useAccount } from '../utils/AccountContext';
import { CertificateCard } from './CertificateCard';
import { loadPEMBlocks } from 'akashjs';


export const ManageCertificate = (props: any) => {
  const account = useAccount();
  const akash = account.akash;
  
  const [certificate, setCertificate] = useState({
    serial: '',
    state: ''
  });

  const [busy, setBusy] = useState(false);

  const getCertificate = async () => {
    if (!akash) {
      return;
    }

    const cert = await loadPEMBlocks(account.address).catch((e) => console.log(e));
    let isValid = false;
    if (cert) {
      const certResponse = await akash.query.cert.list.params({
        owner: account.address,
        serial: cert.serialNumber.toString()
      });
      if (certResponse.certificates.length > 0) {
        const onChainCertificate = certResponse.certificates[0];
        const state = onChainCertificate.certificate?.state;
        isValid = state === 1;
      } else {
        isValid = false;
      }
    }
    setCertificate({
      serial: cert ? cert.serialNumber.toString() : '',
      state: isValid ? 'valid' : 'invalid'
    });
  };

  useEffect(() => {
    getCertificate();
  }, [account]);

  const revoke = async (serial: string) => {
    if (!akash) {
      return;
    }
    setBusy(true);
    const response = await akash.tx.cert.revoke.params({ serial: serial }).catch((e) => {
      setBusy(false);
    });
    await getCertificate();
    setBusy(false);
    console.log(response);
    props.updateBalance();
    return response;
  };

  const create = async () => {
    if (!akash) {
      return;
    }
    setBusy(true);
    const response = await akash.tx.cert.create.client.params().catch((e) => {
      setBusy(false);
    });
    await getCertificate();
    setBusy(false);
    console.log(response);
    props.updateBalance();
    return response;
  };

  return (
    <CertificateCard certificate={certificate} revoke={revoke} create={create} buttonBusy={busy}/>
  );
};