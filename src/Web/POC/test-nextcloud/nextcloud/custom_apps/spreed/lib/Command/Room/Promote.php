<?php

declare(strict_types=1);
/**
 * @copyright Copyright (c) 2020 Daniel Rudolf <nextcloud.com@daniel-rudolf.de>
 *
 * @author Daniel Rudolf <nextcloud.com@daniel-rudolf.de>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\Talk\Command\Room;

use InvalidArgumentException;
use OC\Core\Command\Base;
use OCA\Talk\Exceptions\RoomNotFoundException;
use OCA\Talk\Room;
use Stecman\Component\Symfony\Console\BashCompletion\CompletionContext;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class Promote extends Base {
	use TRoomCommand;

	protected function configure(): void {
		$this
			->setName('talk:room:promote')
			->setDescription('Promotes participants of a room to moderators')
			->addArgument(
				'token',
				InputArgument::REQUIRED,
				'Token of the room in which users should be promoted'
			)->addArgument(
				'participant',
				InputArgument::REQUIRED | InputArgument::IS_ARRAY,
				'Promotes the given participants of the room to moderators'
			);
	}

	protected function execute(InputInterface $input, OutputInterface $output): int {
		$token = $input->getArgument('token');
		$users = $input->getArgument('participant');

		try {
			$room = $this->manager->getRoomByToken($token);
		} catch (RoomNotFoundException $e) {
			$output->writeln('<error>Room not found.</error>');
			return 1;
		}

		if (!in_array($room->getType(), [Room::GROUP_CALL, Room::PUBLIC_CALL], true)) {
			$output->writeln('<error>Room is no group call.</error>');
			return 1;
		}

		try {
			$this->addRoomModerators($room, $users);
		} catch (InvalidArgumentException $e) {
			$output->writeln(sprintf('<error>%s</error>', $e->getMessage()));
			return 1;
		}

		$output->writeln('<info>Participants successfully promoted to moderators.</info>');
		return 0;
	}

	public function completeArgumentValues($argumentName, CompletionContext $context) {
		switch ($argumentName) {
			case 'token':
				return $this->completeTokenValues($context);

			case 'participant':
				return $this->completeParticipantValues($context);
		}

		return parent::completeArgumentValues($argumentName, $context);
	}
}
