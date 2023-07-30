import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);
require('dotenv').config({
  path: '.env.example',
});

afterEach(() => {
  cleanup();
});
