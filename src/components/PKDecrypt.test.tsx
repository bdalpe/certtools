import fs from 'fs';
import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {PKDecrypt} from "./PKDecrypt";
import path from "path";

test('Ensure it renders', () => {
    render(<PKDecrypt/>);
    expect(screen.getByText(/Private Key Decrypter/i)).toBeInTheDocument();
});

test('Decryption should succeed with the correct key', () => {
    render(<PKDecrypt/>);

    const input = screen.getByTestId("input");
    const password = screen.getByTestId("password");
    const button = screen.getByText("Decrypt", {selector: 'button'})

    const file = fs.readFileSync(path.join('tests/encrypted.key'))

    fireEvent.change(input, {target: {value: file.toString()}})
    fireEvent.change(password, {target: {value: "password"}})
    fireEvent.click(button)

    const output: HTMLInputElement = screen.getByTestId("output");

    expect(output.value).toMatch(/-----BEGIN RSA PRIVATE KEY-----.*-----END RSA PRIVATE KEY-----.*/s);
    expect(output.value).not.toContain("Proc-Type: 4,ENCRYPTED")
});

test('Should fail decryption with bad password', () => {
    render(<PKDecrypt/>);

    const input = screen.getByTestId("input");
    const password = screen.getByTestId("password");
    const button = screen.getByText("Decrypt", {selector: 'button'})

    const file = fs.readFileSync(path.join('tests/encrypted.key'))

    fireEvent.change(input, {target: {value: file.toString()}})
    fireEvent.change(password, {target: {value: "test"}})
    fireEvent.click(button)

    const output: HTMLInputElement = screen.getByTestId("output");

    expect(output.value).toEqual("Failed to decrypt. Check passphrase and private key!");
});