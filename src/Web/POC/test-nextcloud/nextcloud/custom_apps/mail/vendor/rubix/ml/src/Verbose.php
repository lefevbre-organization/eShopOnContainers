<?php

namespace Rubix\ML;

use Psr\Log\LoggerInterface;
use Psr\Log\LoggerAwareInterface;

interface Verbose extends LoggerAwareInterface
{
    /**
     * Return the logger or null if not set.
     *
     * @return \Psr\Log\LoggerInterface|null
     */
    public function logger() : ?LoggerInterface;
}
